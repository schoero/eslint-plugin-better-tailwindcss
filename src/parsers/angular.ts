import { MatcherType } from "better-tailwindcss:types/rule.js";
import {
  getLiteralNodesByMatchers,
  isAttributesMatchers,
  isAttributesName,
  isAttributesRegex,
  matchesPathPattern
} from "better-tailwindcss:utils/matchers.js";
import {
  createObjectPathElement,
  deduplicateLiterals,
  getIndentation,
  getQuotes,
  getWhitespace,
  matchesName
} from "better-tailwindcss:utils/utils.js";

import type {
  AST,
  ASTWithSource,
  Binary,
  Call,
  Conditional,
  Interpolation,
  LiteralArray,
  LiteralMap,
  LiteralMapKey,
  LiteralPrimitive,
  ParseSourceSpan,
  TemplateLiteral,
  TemplateLiteralElement,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  TmplAstTextAttribute
} from "@angular/compiler";
import type { Rule } from "eslint";
import type { SourceLocation } from "estree";

import type { BracesMeta, Literal } from "better-tailwindcss:types/ast.js";
import type { Attributes, Matcher, MatcherFunctions } from "better-tailwindcss:types/rule.js";

// https://angular.dev/api/common/NgClass
// https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings

export function getAttributesByAngularElement(ctx: Rule.RuleContext, node: TmplAstElement): (TmplAstBoundAttribute | TmplAstTextAttribute)[] {
  return [
    ...node.attributes,
    ...node.inputs
  ];
}

export function getLiteralsByAngularAttribute(ctx: Rule.RuleContext, attribute: TmplAstBoundAttribute | TmplAstTextAttribute, attributes: Attributes): Literal[] {
  const literals = attributes.reduce<Literal[]>((literals, attributes) => {
    if(isAttributesName(attributes)){
      if(!matchesName(attributes.toLowerCase(), getAttributeName(attribute).toLowerCase())){ return literals; }
      literals.push(...createLiteralsByAngularAttribute(ctx, attribute));
    } else if(isAttributesRegex(attributes)){
      // console.warn("Regex not supported for now");
    } else if(isAttributesMatchers(attributes)){
      if(!matchesName(attributes[0].toLowerCase(), getAttributeName(attribute).toLowerCase())){ return literals; }
      if(isTextAttribute(attribute)){
        literals.push(...createLiteralsByAngularTextAttribute(ctx, attribute));
      }
      if(isBoundAttribute(attribute) && isASTWithSource(attribute.value)){
        literals.push(...getLiteralsByAngularMatchers(ctx, attribute.value.ast, attributes[1]));
      }
    }

    return literals;
  }, []);
  return deduplicateLiterals(literals);
}

function createLiteralsByAngularAst(ctx: Rule.RuleContext, ast: AST): Literal[] {
  if(isInterpolation(ast)){
    return ast.expressions.flatMap(expression => {
      return createLiteralsByAngularAst(ctx, expression);
    });
  }

  if(isLiteralArray(ast)){
    return ast.expressions.flatMap(expression => {
      return createLiteralsByAngularAst(ctx, expression);
    });
  }

  if(isObjectKey(ast)){
    return createLiteralByLiteralMapKey(ctx, ast);
  }

  if(isConditional(ast)){
    return createLiteralsByAngularConditional(ctx, ast);
  }

  if(isLiteralPrimitive(ast)){
    return createLiteralByAngularLiteralPrimitive(ctx, ast);
  }

  if(isTemplateLiteralElement(ast)){
    return createLiteralByAngularTemplateLiteralElement(ctx, ast);
  }

  return [];

}

function createLiteralsByAngularConditional(ctx: Rule.RuleContext, conditional: Conditional): Literal[] {
  const literals: Literal[] = [];

  literals.push(...createLiteralsByAngularAst(ctx, conditional.trueExp));
  literals.push(...createLiteralsByAngularAst(ctx, conditional.falseExp));

  return literals;
}

function createLiteralsByAngularAttribute(ctx: Rule.RuleContext, attribute: TmplAstBoundAttribute | TmplAstTextAttribute): Literal[] {
  if(isTextAttribute(attribute)){
    return createLiteralsByAngularTextAttribute(ctx, attribute);
  }
  if(isBoundAttribute(attribute) && isASTWithSource(attribute.value) && isLiteralPrimitive(attribute.value.ast)){
    return createLiteralsByAngularAst(ctx, attribute.value.ast);
  }
  return [];
}

function getLiteralsByAngularMatchers(ctx: Rule.RuleContext, ast: AST, matchers: Matcher[]): Literal[] {
  const matcherFunctions = getAngularMatcherFunctions(ctx, matchers);
  const matchingAstNodes = getLiteralNodesByMatchers(ctx, ast, matcherFunctions, value => isAST(value) && isCallExpression(value));
  const literals = matchingAstNodes.flatMap(ast => createLiteralsByAngularAst(ctx, ast));
  return deduplicateLiterals(literals);
}

function getAngularMatcherFunctions(ctx: Rule.RuleContext, matchers: Matcher[]): MatcherFunctions<AST> {
  return matchers.reduce<MatcherFunctions<AST>>((matcherFunctions, matcher) => {
    switch (matcher.match){
      case MatcherType.String: {
        matcherFunctions.push((ast): ast is AST => {

          if(
            !isAST(ast) ||

            isInsideConditionalExpressionCondition(ctx, ast) ||
            isInsideLogicalExpressionLeft(ctx, ast) ||

            isObjectKey(ast) ||
            isInsideObjectValue(ctx, ast)){
            return false;
          }

          return isStringLike(ast);
        });
        break;
      }
      case MatcherType.ObjectKey: {
        matcherFunctions.push((ast): ast is AST => {
          if(
            !isAST(ast) ||
            !isObjectKey(ast) ||

            isInsideConditionalExpressionCondition(ctx, ast) ||
            isInsideLogicalExpressionLeft(ctx, ast)){
            return false;
          }

          const path = getAngularObjectPath(ctx, ast);

          if(!path || !matcher.pathPattern){
            return true;
          }

          return matchesPathPattern(path, matcher.pathPattern);
        });
        break;
      }
      case MatcherType.ObjectValue: {
        matcherFunctions.push((ast): ast is AST => {
          if(
            !isAST(ast) ||
            !hasParent(ast) ||
            !isInsideObjectValue(ctx, ast) ||

            isInsideConditionalExpressionCondition(ctx, ast) ||
            isInsideLogicalExpressionLeft(ctx, ast) ||
            isObjectKey(ast) ||

            !isStringLike(ast)
          ){
            return false;
          }

          const path = getAngularObjectPath(ctx, ast);

          if(!path || !matcher.pathPattern){
            return true;
          }

          return matchesPathPattern(path, matcher.pathPattern);
        });
        break;
      }
    }
    return matcherFunctions;
  }, []);
}

function getAngularObjectPath(ctx: Rule.RuleContext, ast: AST): string | undefined {
  const parent = findParent(ctx, ast);

  if(!parent){
    return;
  }

  const paths: (string | undefined)[] = [];

  if(isObjectKey(ast)){
    paths.unshift(createObjectPathElement(ast.key));
  }

  if(isLiteralArray(parent)){
    const index = parent.expressions.indexOf(ast);
    paths.unshift(`[${index}]`);
  }

  if(isLiteralMap(parent) && isInsideObjectValue(ctx, ast)){
    const keyIndex = parent.values.indexOf(ast);
    const objectKey = parent.keys[keyIndex];

    if(objectKey && isObjectKey(objectKey)){
      paths.unshift(createObjectPathElement(objectKey.key));
    }
  }

  paths.unshift(getAngularObjectPath(ctx, parent));

  return paths.reduce<string[]>((paths, currentPath) => {
    if(!currentPath){ return paths; }

    if(paths.length === 0){
      return [currentPath];
    }

    if(currentPath.startsWith("[") && currentPath.endsWith("]")){
      return [...paths, currentPath];
    }

    return [...paths, ".", currentPath];
  }, []).join("");

}

function createLiteralByLiteralMapKey(ctx: Rule.RuleContext, key: LiteralMapKey): Literal[] {
  // @ts-expect-error - angular types are faulty
  const literalMap = key?.parent as LiteralMap | undefined;
  // @ts-expect-error - angular types are faulty
  const objectContent = literalMap?.parent?.source;
  const keyContent = key?.key;
  const keyIndex = literalMap?.keys.indexOf(key);

  if(keyIndex === undefined || keyIndex === -1){
    return [];
  }

  const previousValue = literalMap?.values[keyIndex - 1];
  const value = literalMap?.values[keyIndex];

  if(!literalMap?.sourceSpan || typeof objectContent !== "string" || typeof keyContent !== "string"){
    return [];
  }

  const rangeStart = previousValue?.span?.end ?? 0;
  const rangeEnd = value?.span?.start ?? objectContent.length;

  const slice = objectContent.slice(rangeStart, rangeEnd);

  const start = rangeStart + slice.indexOf(keyContent) - (key.quoted ? 1 : 0);
  const end = start + keyContent.length + (key.quoted ? 1 : 0);

  const raw = objectContent.slice(start, end);
  const quotes = getQuotes(raw);
  const whitespaces = getWhitespace(keyContent);
  const range = [literalMap.sourceSpan.start + start, literalMap.sourceSpan.start + end] satisfies [number, number];
  const loc = getLocByRange(ctx, range);
  const line = ctx.sourceCode.lines[loc.start.line - 1] ?? "";
  const indentation = getIndentation(line);

  return [{
    ...quotes,
    ...whitespaces,
    content: keyContent,
    indentation,
    loc,
    range,
    raw,
    supportsMultiline: false,
    type: "StringLiteral"
  }];
}

function createLiteralsByAngularTextAttribute(ctx: Rule.RuleContext, attribute: TmplAstTextAttribute): Literal[] {
  const content = attribute.value;

  if(!attribute.valueSpan){
    return [];
  }

  const start = attribute.valueSpan.fullStart;
  const end = attribute.valueSpan.end;
  const range = [start.offset - 1, end.offset + 1] satisfies [number, number];
  const raw = attribute.sourceSpan.start.file.content.slice(...range);
  const quotes = getQuotes(raw);
  const whitespaces = getWhitespace(content);
  const loc = convertParseSourceSpanToLoc(attribute.valueSpan);
  const line = ctx.sourceCode.lines[loc.start.line - 1];
  const indentation = getIndentation(line);
  const supportsMultiline = true;

  return [{
    ...quotes,
    ...whitespaces,
    content,
    indentation,
    loc,
    range,
    raw,
    supportsMultiline,
    type: "StringLiteral"
  }];
}

function createLiteralByAngularLiteralPrimitive(ctx: Rule.RuleContext, literal: LiteralPrimitive): Literal[] {
  const content = literal.value;

  if(!literal.sourceSpan){
    return [];
  }

  const start = literal.sourceSpan.start;
  const end = literal.sourceSpan.end;
  const range = [start, end] satisfies [number, number];
  const raw = ctx.sourceCode.text.slice(...range);
  const quotes = getQuotes(raw);
  const whitespaces = getWhitespace(content);
  const loc = getLocByRange(ctx, range);
  const line = ctx.sourceCode.lines[loc.start.line - 1];
  const indentation = getIndentation(line);
  const supportsMultiline = true;

  return [{
    ...quotes,
    ...whitespaces,
    content,
    indentation,
    loc,
    range,
    raw,
    supportsMultiline,
    type: "StringLiteral"
  }];
}

function createLiteralByAngularTemplateLiteralElement(ctx: Rule.RuleContext, literal: TemplateLiteralElement): Literal[] {
  const content = literal.text;

  if(!literal.sourceSpan || !hasParent(literal)){
    return [];
  }

  const braces = getBraces(literal);
  const isInterpolated = getIsInterpolated(literal);
  const start = literal.sourceSpan.start - (braces.closingBraces?.length ?? 0);
  const end = literal.sourceSpan.end + (braces.openingBraces?.length ?? 0);
  const range = [start, end] satisfies [number, number];
  const raw = ctx.sourceCode.text.slice(...range);
  const quotes = getQuotes(raw);
  const whitespaces = getWhitespace(content);
  const loc = getLocByRange(ctx, range);

  const parent = literal.parent;
  const parentStart = parent.sourceSpan?.start;
  const parentEnd = parent.sourceSpan?.end;
  const parentRange = [parentStart, parentEnd] satisfies [number, number];
  const parentLoc = getLocByRange(ctx, parentRange);
  const parentLine = ctx.sourceCode.lines[parentLoc.start.line - 1];
  const indentation = getIndentation(parentLine);
  const supportsMultiline = true;

  return [{
    ...quotes,
    ...whitespaces,
    ...braces,
    content,
    indentation,
    isInterpolated,
    loc,
    range,
    raw,
    supportsMultiline,
    type: "TemplateLiteral"
  }];
}

function getLocByRange(ctx: Rule.RuleContext, range: [number, number]): SourceLocation {
  const [rangeStart, rangeEnd] = range;

  const loc: SourceLocation = {
    end: ctx.sourceCode.getLocFromIndex(rangeEnd),
    start: ctx.sourceCode.getLocFromIndex(rangeStart)
  };

  return loc;
}

function convertParseSourceSpanToLoc(sourceSpan: ParseSourceSpan): SourceLocation {
  return {
    end: {
      column: sourceSpan.end.col,
      line: sourceSpan.end.line + 1
    },
    start: {
      column: sourceSpan.fullStart.col,
      line: sourceSpan.fullStart.line + 1
    }
  };
}

function isInsideInlineTemplate(ctx: Rule.RuleContext) {
  return getInlineTemplateComponentIndex(ctx) !== undefined;
}

function getInlineTemplateComponentIndex(ctx: Rule.RuleContext) {
  const matches = ctx.filename.match(/^.*_inline-template-[\w.-]+-(\d+)\.component\.html$/);

  if(matches){
    const [, index] = matches;
    return +index;
  }
}

function getBraces(literal: TemplateLiteralElement): BracesMeta {
  if(!hasParent(literal)){
    return {};
  }

  const parent = literal.parent as TemplateLiteral;
  const index = parent.elements.indexOf(literal);

  if(parent.elements.length === 1){
    return {};
  }

  return {
    closingBraces: index >= 1 ? "}" : undefined,
    openingBraces: index < parent.elements.length - 1 ? "${" : undefined
  };
}

function getIsInterpolated(literal: TemplateLiteralElement): boolean {
  const braces = getBraces(literal);
  return !!braces.closingBraces || !!braces.openingBraces;
}

function getAttributeName(node: TmplAstBoundAttribute | TmplAstTextAttribute): string {
  if(!node.keySpan){
    return node.name;
  }

  return node.sourceSpan.start.offset !== node.keySpan.start.offset
    ? node.sourceSpan.fullStart.file.content.slice(node.sourceSpan.start.offset, node.keySpan.end.offset + 1)
    : node.keySpan.toString() ?? node.name;
}

export type Parent = {
  parent: AST;
};

function isInsideConditionalExpressionCondition(ctx: Rule.RuleContext, ast: AST): boolean {
  const parent = findParent(ctx, ast);
  if(!parent){ return false; }

  if(isConditional(parent) && parent.condition === ast){
    return true;
  }

  return isInsideConditionalExpressionCondition(ctx, parent);
}

function isInsideLogicalExpressionLeft(ctx: Rule.RuleContext, ast: AST): boolean {
  const parent = findParent(ctx, ast);
  if(!parent){ return false; }

  if(isBinary(parent) && parent.operation === "&&" && parent.left === ast){
    return true;
  }

  return isInsideConditionalExpressionCondition(ctx, parent);
}

function isInsideObjectValue(ctx: Rule.RuleContext, ast: AST): boolean {
  const parent = findParent(ctx, ast);
  if(!parent){ return false; }

  // #34 allow call expressions as object values
  if(isCallExpression(ast)){ return false; }

  if(isObjectValue(ast)){
    return true;
  }

  if(isLiteralMap(parent) && parent.values.includes(ast)){
    return true;
  }

  return isInsideObjectValue(ctx, parent);
}

function isStringLike(ast: AST): ast is LiteralPrimitive | TemplateLiteralElement {
  return isStringLiteral(ast) || isTemplateLiteralElement(ast);
}

function hasParent(ast: AST): ast is AST & Parent {
  return "parent" in ast && ast.parent !== undefined;
}

/**
 * The angular parser doesn't provide parent references for all nodes. This function traverses the entire AST
 * to find the parent node of the given AST reference.
 *
 * @param ctx The ESLint rule context.
 * @param astNode The AST node to find the parent for.
 * @returns The parent AST node, or undefined if not found.
 */
function findParent(ctx: Rule.RuleContext, astNode: AST): AST | undefined {
  if(hasParent(astNode)){
    return astNode.parent;
  }

  const ast = ctx.sourceCode.ast;

  const visitChildNode = (childNode: unknown) => {
    if(!childNode || typeof childNode !== "object"){
      return;
    }

    for(const key in childNode){
      if(key === "parent"){
        continue;
      }

      if(childNode[key] === astNode){
        return childNode;
      }

      const result = visitChildNode(childNode[key]);

      if(result){
        return result;
      }
    }
  };

  return visitChildNode(ast);
}

function isObjectValue(ast: AST): ast is LiteralPrimitive {
  return isStringLiteral(ast) && hasParent(ast) && isLiteralMap(ast.parent);
}

function isObjectKey(ast: Record<string, any>): ast is LiteralMapKey {
  return "type" in ast && ast.type === "Object" && "key" in ast && ast.key !== undefined;
}

function isStringLiteral(ast: AST): ast is LiteralPrimitive {
  return isLiteralPrimitive(ast) && typeof ast.value === "string";
}

export function isAST(ast: unknown): ast is AST {
  return typeof ast === "object" && ast !== null && "type" in ast;
}

function is<Type extends AST | TmplAstNode>(ast: AST | TmplAstNode, type: string): ast is Type {
  return "type" in ast && typeof ast.type === "string" && ast.type === type;
}

const isCallExpression = (ast: AST) => is<Call>(ast, "Call");
const isASTWithSource = (ast: AST) => is<ASTWithSource>(ast, "ASTWithSource");
const isInterpolation = (ast: AST) => is<Interpolation>(ast, "Interpolation");
const isConditional = (ast: AST) => is<Conditional>(ast, "Conditional");
const isBinary = (ast: AST) => is<Binary>(ast, "Binary");
const isLiteralArray = (ast: AST) => is<LiteralArray>(ast, "LiteralArray");
const isLiteralMap = (ast: AST) => is<LiteralMap>(ast, "LiteralMap");
const isTemplateLiteral = (ast: AST) => is<TemplateLiteral>(ast, "TemplateLiteral");
const isTemplateLiteralElement = (ast: AST) => is<TemplateLiteralElement>(ast, "TemplateLiteralElement");
const isLiteralPrimitive = (ast: AST) => is<LiteralPrimitive>(ast, "LiteralPrimitive");

const isTextAttribute = (ast: TmplAstBoundAttribute | TmplAstTextAttribute) => is<TmplAstTextAttribute>(ast, "TextAttribute");
const isBoundAttribute = (ast: TmplAstBoundAttribute | TmplAstTextAttribute) => is<TmplAstBoundAttribute>(ast, "BoundAttribute");
