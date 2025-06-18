import { MatcherType } from "better-tailwindcss:types/rule.js";
import {
  findMatchingParentNodes,
  getLiteralNodesByMatchers,
  isCalleeMatchers,
  isCalleeName,
  isCalleeRegex,
  isInsideConditionalExpressionTest,
  isInsideLogicalExpressionLeft,
  isInsideMemberExpression,
  isTagMatchers,
  isTagName,
  isTagRegex,
  isVariableMatchers,
  isVariableName,
  isVariableRegex,
  matchesPathPattern
} from "better-tailwindcss:utils/matchers.js";
import { getLiteralsByNodeAndRegex } from "better-tailwindcss:utils/regex.js";
import {
  deduplicateLiterals,
  getContent,
  getIndentation,
  getQuotes,
  getWhitespace,
  matchesName
} from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";
import type {
  ArrowFunctionExpression as ESArrowFunctionExpression,
  BaseNode as ESBaseNode,
  CallExpression as ESCallExpression,
  Expression as ESExpression,
  Identifier as ESIdentifier,
  Node as ESNode,
  SimpleLiteral as ESSimpleLiteral,
  SpreadElement as ESSpreadElement,
  TaggedTemplateExpression as ESTaggedTemplateExpression,
  TemplateElement as ESTemplateElement,
  TemplateLiteral as ESTemplateLiteral,
  VariableDeclarator as ESVariableDeclarator
} from "estree";

import type {
  BracesMeta,
  Literal,
  LiteralValueQuotes,
  MultilineMeta,
  StringLiteral,
  TemplateLiteral
} from "better-tailwindcss:types/ast.js";
import type {
  Callees,
  Matcher,
  MatcherFunctions,
  RegexConfig,
  Tags,
  Variables
} from "better-tailwindcss:types/rule.js";


export const ES_CONTAINER_TYPES_TO_REPLACE_QUOTES: string[] = [
  "ArrayExpression",
  "Property",
  "CallExpression",
  "VariableDeclarator",
  "ConditionalExpression",
  "LogicalExpression"
];

export const ES_CONTAINER_TYPES_TO_INSERT_BRACES: string[] = [
];


export function getLiteralsByESVariableDeclarator(ctx: Rule.RuleContext, node: ESVariableDeclarator, variables: Variables): Literal[] {

  const literals = variables.reduce<Literal[]>((literals, variable) => {

    if(!node.init){ return literals; }
    if(!isESVariableSymbol(node.id)){ return literals; }

    if(isVariableName(variable)){
      if(!matchesName(variable, node.id.name)){ return literals; }
      literals.push(...getLiteralsByESExpression(ctx, [node.init]));
    } else if(isVariableRegex(variable)){
      literals.push(...getLiteralsByESNodeAndRegex(ctx, node, variable));
    } else if(isVariableMatchers(variable)){
      if(!matchesName(variable[0], node.id.name)){ return literals; }
      if(isESArrowFunctionExpression(node.init) || isESCallExpression(node.init)){ return literals; }
      literals.push(...getLiteralsByESMatchers(ctx, node.init, variable[1]));
    }

    return literals;
  }, []);

  return deduplicateLiterals(literals);

}

export function getLiteralsByESCallExpression(ctx: Rule.RuleContext, node: ESCallExpression, callees: Callees): Literal[] {

  const literals = callees.reduce<Literal[]>((literals, callee) => {
    if(!isESCalleeSymbol(node.callee)){ return literals; }

    if(isCalleeName(callee)){
      if(!matchesName(callee, node.callee.name)){ return literals; }
      literals.push(...getLiteralsByESExpression(ctx, node.arguments));
    } else if(isCalleeRegex(callee)){
      literals.push(...getLiteralsByESNodeAndRegex(ctx, node, callee));
    } else if(isCalleeMatchers(callee)){
      if(!matchesName(callee[0], node.callee.name)){ return literals; }
      literals.push(...getLiteralsByESMatchers(ctx, node, callee[1]));
    }

    return literals;
  }, []);

  return deduplicateLiterals(literals);

}

export function getLiteralsByTaggedTemplateExpression(ctx: Rule.RuleContext, node: ESTaggedTemplateExpression, tags: Tags): Literal[] {

  const literals = tags.reduce<Literal[]>((literals, tag) => {
    if(!isTaggedTemplateSymbol(node.tag)){ return literals; }

    if(isTagName(tag)){
      if(tag !== node.tag.name){ return literals; }
      literals.push(...getLiteralsByESTemplateLiteral(ctx, node.quasi));
    } else if(isTagRegex(tag)){
      literals.push(...getLiteralsByESNodeAndRegex(ctx, node, tag));
    } else if(isTagMatchers(tag)){
      if(tag[0] !== node.tag.name){ return literals; }
      literals.push(...getLiteralsByESMatchers(ctx, node, tag[1]));
    }

    return literals;
  }, []);

  return deduplicateLiterals(literals);

}

export function getLiteralsByESLiteralNode(ctx: Rule.RuleContext, node: ESBaseNode): Literal[] {

  if(isESSimpleStringLiteral(node)){
    const literal = getStringLiteralByESStringLiteral(ctx, node);
    return literal ? [literal] : [];
  }

  if(isESTemplateLiteral(node)){
    return getLiteralsByESTemplateLiteral(ctx, node);
  }

  if(isESTemplateElement(node) && hasESNodeParentExtension(node)){
    const literal = getLiteralByESTemplateElement(ctx, node);
    return literal ? [literal] : [];
  }

  return [];

}

export function getLiteralsByESMatchers(ctx: Rule.RuleContext, node: ESBaseNode, matchers: Matcher[]): Literal[] {
  const matcherFunctions = getESMatcherFunctions(matchers);
  const literalNodes = getLiteralNodesByMatchers(ctx, node, matcherFunctions);
  const literals = literalNodes.flatMap(literalNode => getLiteralsByESLiteralNode(ctx, literalNode));
  return deduplicateLiterals(literals);
}

export function getLiteralsByESNodeAndRegex(
  ctx: Rule.RuleContext,
  node: ESBaseNode,
  regex: RegexConfig
): Literal[] {
  if(!hasESNodeParentExtension(node)){ return []; }

  return getLiteralsByNodeAndRegex(
    ctx,
    node,
    regex,
    {
      getLiteralsByMatchingNode: (node: unknown) => {
        if(!isESNode(node)){ return; }

        if(isESSimpleStringLiteral(node)){
          const literal = getStringLiteralByESStringLiteral(ctx, node);
          return literal ? [literal] : [];
        }

        if(isESTemplateElement(node) && hasESNodeParentExtension(node)){
          const templateLiteralNode = findParentESTemplateLiteralByESTemplateElement(node);
          return templateLiteralNode && getLiteralsByESTemplateLiteral(ctx, templateLiteralNode);
        }
      },
      getNodeByRangeStart: (start: number) => ctx.sourceCode.getNodeByRangeIndex(start),
      getNodeRange: node => isESNode(node) ? [node.range?.[0], node.range?.[1]] : undefined,
      getNodeSourceCode: node => isESNode(node) ? ctx.sourceCode.getText(node) : undefined
    }
  );
}

export function getStringLiteralByESStringLiteral(ctx: Rule.RuleContext, node: ESSimpleStringLiteral): StringLiteral | undefined {

  const raw = node.raw;

  if(!raw || !node.loc || !node.range || !node.parent.loc || !node.parent.range){
    return;
  }

  const line = ctx.sourceCode.lines[node.loc.start.line - 1];

  const quotes = getQuotes(raw);
  const priorLiterals = findPriorLiterals(ctx, node);
  const content = getContent(raw, quotes);
  const whitespaces = getWhitespace(content);
  const indentation = getIndentation(line);
  const multilineQuotes = getMultilineQuotes(node);
  const supportsMultiline = !isESObjectKey(node);

  return {
    ...quotes,
    ...whitespaces,
    ...multilineQuotes,
    content,
    indentation,
    loc: node.loc,
    priorLiterals,
    range: node.range,
    raw,
    supportsMultiline,
    type: "StringLiteral"
  };

}

function getLiteralByESTemplateElement(ctx: Rule.RuleContext, node: ESTemplateElement & Rule.Node): TemplateLiteral | undefined {

  const raw = ctx.sourceCode.getText(node);

  if(!raw || !node.loc || !node.range || !node.parent.loc || !node.parent.range){
    return;
  }

  const line = ctx.sourceCode.lines[node.parent.loc.start.line - 1];

  const quotes = getQuotes(raw);
  const braces = getBracesByString(ctx, raw);
  const priorLiterals = findPriorLiterals(ctx, node);
  const content = getContent(raw, quotes, braces);
  const whitespaces = getWhitespace(content);
  const indentation = getIndentation(line);
  const multilineQuotes = getMultilineQuotes(node);

  return {
    ...whitespaces,
    ...quotes,
    ...braces,
    ...multilineQuotes,
    content,
    indentation,
    loc: node.loc,
    priorLiterals,
    range: node.range,
    raw,
    supportsMultiline: true,
    type: "TemplateLiteral"
  };

}

function getMultilineQuotes(node: ESNode & Rule.NodeParentExtension): MultilineMeta {
  const surroundingBraces = ES_CONTAINER_TYPES_TO_INSERT_BRACES.includes(node.parent.type);
  const multilineQuotes: LiteralValueQuotes[] = ES_CONTAINER_TYPES_TO_REPLACE_QUOTES.includes(node.parent.type)
    ? ["`"]
    : [];

  return {
    multilineQuotes,
    surroundingBraces
  };
}

function getLiteralsByESExpression(ctx: Rule.RuleContext, args: (ESExpression | ESSpreadElement)[]): Literal[] {
  return args.reduce<Literal[]>((acc, node) => {
    if(node.type === "SpreadElement"){ return acc; }

    acc.push(...getLiteralsByESLiteralNode(ctx, node));
    return acc;
  }, []);
}

export function getLiteralsByESTemplateLiteral(ctx: Rule.RuleContext, node: ESTemplateLiteral): Literal[] {
  return node.quasis.map(quasi => {
    if(!hasESNodeParentExtension(quasi)){
      return;
    }
    return getLiteralByESTemplateElement(ctx, quasi);
  }).filter((literal): literal is TemplateLiteral => literal !== undefined);
}

export function findParentESTemplateLiteralByESTemplateElement(node: ESNode & Partial<Rule.NodeParentExtension>): ESTemplateLiteral | undefined {
  if(!hasESNodeParentExtension(node)){ return; }
  if(node.parent.type === "TemplateLiteral"){ return node.parent; }
  return findParentESTemplateLiteralByESTemplateElement(node.parent);
}

function findPriorLiterals(ctx: Rule.RuleContext, node: ESNode) {

  if(!hasESNodeParentExtension(node)){ return; }

  const priorLiterals: Literal[] = [];
  let currentNode: ESNode = node;

  while(hasESNodeParentExtension(currentNode)){
    const parent = currentNode.parent;

    if(isESCallExpression(parent)){ break; }
    if(isESArrowFunctionExpression(parent)){ break; }
    if(isESVariableDeclarator(parent)){ break; }

    if(parent.type === "TemplateLiteral"){
      for(const quasi of parent.quasis){
        if(quasi.range === node.range){
          break;
        }

        if(quasi.type === "TemplateElement" && hasESNodeParentExtension(quasi)){
          const literal = getLiteralByESTemplateElement(ctx, quasi);

          if(!literal){
            continue;
          }

          priorLiterals.push(literal);
        }
      }
    }

    if(parent.type === "TemplateElement"){
      const literal = getLiteralByESTemplateElement(ctx, parent);

      if(!literal){
        continue;
      }

      priorLiterals.push(literal);
    }

    if(parent.type === "Literal"){
      const literal = getLiteralsByESLiteralNode(ctx, parent);

      if(!literal){
        continue;
      }

      priorLiterals.push(...literal);
    }

    currentNode = parent;

  }

  return priorLiterals;

}

export function getESObjectPath(node: ESNode & Partial<Rule.NodeParentExtension>): string | undefined {

  if(!hasESNodeParentExtension(node)){ return; }

  if(
    node.type !== "Property" &&
    node.type !== "ObjectExpression" &&
    node.type !== "ArrayExpression" &&
    node.type !== "Identifier" &&
    node.type !== "Literal"
  ){
    return;
  }

  const paths: (string | undefined)[] = [];

  if(node.type === "Property"){
    if(node.key.type === "Identifier"){
      paths.unshift(createObjectPathElement(node.key.name));
    } else if(node.key.type === "Literal"){
      paths.unshift(createObjectPathElement(node.key.value?.toString() ?? node.key.raw));
    } else {
      return "";
    }
  }

  if(isESStringLike(node) && isInsideObjectValue(node)){
    const property = findMatchingParentNodes<ESNode>(node, [(node): node is ESNode => {
      return isESNode(node) && node.type === "Property";
    }])[0];

    return getESObjectPath(property);
  }

  if(isESObjectKey(node)){
    const property = node.parent;
    return getESObjectPath(property);
  }

  if(node.parent.type === "ArrayExpression" && node.type !== "Property"){
    const index = node.parent.elements.indexOf(node);
    paths.unshift(`[${index}]`);
  }

  paths.unshift(getESObjectPath(node.parent));

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

function createObjectPathElement(path?: string): string {
  if(!path){ return ""; }

  return path.match(/^[A-Z_a-z]\w*$/)
    ? path
    : `["${path}"]`;
}


export interface ESSimpleStringLiteral extends Rule.NodeParentExtension, ESSimpleLiteral {
  value: string;
}

export function isESObjectKey(node: ESBaseNode & Rule.NodeParentExtension) {
  return (
    node.parent.type === "Property" &&
    node.parent.parent.type === "ObjectExpression" &&
    node.parent.key === node
  );
}

export function isInsideObjectValue(node: ESBaseNode & Partial<Rule.NodeParentExtension>) {
  if(!hasESNodeParentExtension(node)){ return false; }

  // #34 allow call expressions as object values
  if(isESCallExpression(node)){ return false; }
  if(isESArrowFunctionExpression(node)){ return false; }

  if(
    node.parent.type === "Property" &&
    node.parent.parent.type === "ObjectExpression" &&
    node.parent.value === node
  ){
    return true;
  }

  return isInsideObjectValue(node.parent);
}

export function isESSimpleStringLiteral(node: ESBaseNode): node is ESSimpleStringLiteral {
  return (
    node.type === "Literal" &&
    "value" in node &&
    typeof node.value === "string"
  );
}

export function isESStringLike(node: ESBaseNode): node is ESSimpleStringLiteral | ESTemplateElement {
  return isESSimpleStringLiteral(node) || isESTemplateElement(node);
}

export function isESTemplateLiteral(node: ESBaseNode): node is ESTemplateLiteral {
  return node.type === "TemplateLiteral";
}

export function isESTemplateElement(node: ESBaseNode): node is ESTemplateElement {
  return node.type === "TemplateElement";
}

export function isESNode(node: unknown): node is ESNode {
  return (
    node !== null &&
    typeof node === "object" &&
    "type" in node
  );
}

export function isESCallExpression(node: ESBaseNode): node is ESCallExpression {
  return node.type === "CallExpression";
}

export function isESArrowFunctionExpression(node: ESBaseNode): node is ESArrowFunctionExpression {
  return node.type === "ArrowFunctionExpression";
}

function isESCalleeSymbol(node: ESBaseNode & Partial<Rule.NodeParentExtension>): node is ESIdentifier {
  return node.type === "Identifier" && !!node.parent && isESCallExpression(node.parent);
}

function isTaggedTemplateExpression(node: ESBaseNode): node is ESTaggedTemplateExpression {
  return node.type === "TaggedTemplateExpression";
}

function isTaggedTemplateSymbol(node: ESBaseNode & Partial<Rule.NodeParentExtension>): node is ESIdentifier {
  return node.type === "Identifier" && !!node.parent && isTaggedTemplateExpression(node.parent);
}

export function isESVariableDeclarator(node: ESBaseNode): node is ESVariableDeclarator {
  return node.type === "VariableDeclarator";
}

function isESVariableSymbol(node: ESBaseNode & Partial<Rule.NodeParentExtension>): node is ESIdentifier {
  return node.type === "Identifier" && !!node.parent && isESVariableDeclarator(node.parent);
}

export function hasESNodeParentExtension(node: ESBaseNode): node is Rule.Node & Rule.NodeParentExtension {
  return "parent" in node && !!node.parent;
}

function getBracesByString(ctx: Rule.RuleContext, raw: string): BracesMeta {
  const closingBraces = raw.startsWith("}") ? "}" : undefined;
  const openingBraces = raw.endsWith("${") ? "${" : undefined;

  return {
    closingBraces,
    openingBraces
  };
}

function getESMatcherFunctions(matchers: Matcher[]): MatcherFunctions<ESNode> {
  return matchers.reduce<MatcherFunctions<ESNode>>((matcherFunctions, matcher) => {
    switch (matcher.match){
      case MatcherType.String: {
        matcherFunctions.push((node): node is ESNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||

            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isInsideMemberExpression(node) ||

            isESObjectKey(node) ||
            isInsideObjectValue(node)){
            return false;
          }

          return isESStringLike(node);
        });
        break;
      }
      case MatcherType.ObjectKey: {
        matcherFunctions.push((node): node is ESNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||
            !isESObjectKey(node) ||

            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isInsideMemberExpression(node)){
            return false;
          }

          const path = getESObjectPath(node);

          if(!path || !matcher.pathPattern){
            return true;
          }

          return matchesPathPattern(path, matcher.pathPattern);
        });
        break;
      }
      case MatcherType.ObjectValue: {
        matcherFunctions.push((node): node is ESNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||
            !isInsideObjectValue(node) ||

            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isInsideMemberExpression(node) ||
            isESObjectKey(node) ||

            !isESStringLike(node)){
            return false;
          }

          const path = getESObjectPath(node);

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
