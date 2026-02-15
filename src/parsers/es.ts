import { MatcherType } from "better-tailwindcss:types/rule.js";
import {
  findMatchingParentNodes,
  getLiteralNodesByMatchers,
  isIndexedAccessLiteral,
  isInsideBinaryExpression,
  isInsideConditionalExpressionTest,
  isInsideLogicalExpressionLeft,
  isInsideMemberExpression,
  matchesPathPattern
} from "better-tailwindcss:utils/matchers.js";
import {
  createObjectPathElement,
  deduplicateLiterals,
  getContent,
  getIndentation,
  getQuotes,
  getWhitespace,
  isGenericNodeWithParent,
  matchesName
} from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";
import type {
  ArrowFunctionExpression as ESArrowFunctionExpression,
  BaseNode as ESBaseNode,
  CallExpression as ESCallExpression,
  Expression as ESExpression,
  Identifier as ESIdentifier,
  MemberExpression as ESMemberExpression,
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
import type { WithParent } from "better-tailwindcss:types/estree.js";
import type {
  CalleeSelector,
  CallTarget,
  MatcherFunctions,
  SelectorMatcher,
  TagSelector,
  VariableSelector
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


export function getLiteralsByESVariableDeclarator(ctx: Rule.RuleContext, node: ESVariableDeclarator, selectors: VariableSelector[]): Literal[] {

  const literals = selectors.reduce<Literal[]>((literals, selector) => {

    if(!node.init){ return literals; }
    if(!isESVariableSymbol(node.id)){ return literals; }
    if(!matchesName(selector.name, node.id.name)){ return literals; }

    if(!selector.match){
      literals.push(...getLiteralsByESExpression(ctx, [node.init]));
      return literals;
    }

    if(isESArrowFunctionExpression(node.init) || isESCallExpression(node.init)){ return literals; }

    literals.push(...getLiteralsByESMatchers(ctx, node.init, selector.match));

    return literals;
  }, []);

  return literals.filter(deduplicateLiterals);

}

export function getLiteralsByESCallExpression(ctx: Rule.RuleContext, node: ESCallExpression, selectors: CalleeSelector[]): Literal[] {

  if(isNestedCurriedCall(node)){
    return [];
  }

  const callChain = getCurriedCallChain(node);

  if(!callChain){
    return [];
  }

  const { baseCalleeName, calls } = callChain;

  const literals = selectors.reduce<Literal[]>((literals, selector) => {
    const selectorName = selector.path ?? selector.name;

    if(!selectorName || !matchesName(selectorName, baseCalleeName)){ return literals; }

    const targetCalls = getTargetCalls(calls, selector.callTarget);

    for(const targetCall of targetCalls){
      if(!selector.match){
        literals.push(...getLiteralsByESExpression(ctx, targetCall.arguments));
        continue;
      }

      literals.push(...getLiteralsByESMatchers(ctx, targetCall, selector.match));
    }

    return literals;
  }, []);

  return literals.filter(deduplicateLiterals);

}

export function getLiteralsByTaggedTemplateExpression(ctx: Rule.RuleContext, node: ESTaggedTemplateExpression, selectors: TagSelector[]): Literal[] {

  const literals = selectors.reduce<Literal[]>((literals, selector) => {
    if(!isTaggedTemplateSymbol(node.tag)){ return literals; }
    if(!matchesName(selector.name, node.tag.name)){ return literals; }

    if(!selector.match){
      literals.push(...getLiteralsByESTemplateLiteral(ctx, node.quasi));
      return literals;
    }

    literals.push(...getLiteralsByESMatchers(ctx, node, selector.match));

    return literals;
  }, []);

  return literals.filter(deduplicateLiterals);

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

export function getLiteralsByESMatchers(ctx: Rule.RuleContext, node: ESBaseNode, matchers: SelectorMatcher[]): Literal[] {
  const matcherFunctions = getESMatcherFunctions(matchers);
  const literalNodes = getLiteralNodesByMatchers(ctx, node, matcherFunctions);
  const literals = literalNodes.flatMap(literalNode => getLiteralsByESLiteralNode(ctx, literalNode));
  return literals.filter(deduplicateLiterals);
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
    isInterpolated: false,
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
  const isInterpolated = getIsInterpolated(ctx, raw);
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
    isInterpolated,
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

export function findParentESTemplateLiteralByESTemplateElement(node: WithParent<ESNode>): ESTemplateLiteral | undefined {
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

export function getESObjectPath(node: WithParent<ESNode>): string | undefined {

  if(!isGenericNodeWithParent(node)){ return; }
  if(!hasESNodeParentExtension(node)){ return; }

  if(
    node.type !== "Property" &&
    node.type !== "ObjectExpression" &&
    node.type !== "ArrayExpression" &&
    node.type !== "Identifier" &&
    node.type !== "Literal" &&
    node.type !== "TemplateElement"
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

  if(node.parent.type === "ArrayExpression" && node.type !== "Property" && node.type !== "TemplateElement"){
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

export function isInsideObjectValue(node: WithParent<ESNode>) {
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

function getESMemberExpressionPropertyName(node: ESMemberExpression): string | undefined {
  if(!node.computed && node.property.type === "Identifier"){
    return node.property.name;
  }

  if(node.computed && isESSimpleStringLiteral(node.property)){
    return node.property.value;
  }
}

function getESCalleeName(node: ESBaseNode): string | undefined {
  if(node.type === "Identifier" && "name" in node && typeof node.name === "string"){
    return node.name;
  }

  if(node.type === "MemberExpression" && "object" in node){
    const memberNode = node as ESMemberExpression;

    if(memberNode.object.type === "Super"){
      return;
    }

    const object = getESCalleeName(memberNode.object as ESBaseNode);
    const property = getESMemberExpressionPropertyName(memberNode);

    if(!object || !property){
      return;
    }

    return `${object}.${property}`;
  }

  if(node.type === "ChainExpression" && "expression" in node){
    return getESCalleeName(node.expression as ESBaseNode);
  }
}

function isNestedCurriedCall(node: ESCallExpression): boolean {
  return hasESNodeParentExtension(node) && isESCallExpression(node.parent) && node.parent.callee === node;
}

function getCurriedCallChain(node: ESCallExpression): undefined | { baseCalleeName: string; calls: ESCallExpression[]; } {
  const calls: ESCallExpression[] = [node];
  let currentCall: ESCallExpression = node;

  while(isESCallExpression(currentCall.callee)){
    currentCall = currentCall.callee;
    calls.unshift(currentCall);
  }

  const baseCalleeName = getESCalleeName(currentCall.callee);

  if(!baseCalleeName){
    return;
  }

  return {
    baseCalleeName,
    calls
  };
}

function getTargetCalls(calls: ESCallExpression[], callTarget: CallTarget | undefined): ESCallExpression[] {
  if(calls.length === 0){
    return [];
  }

  if(callTarget === "all"){
    return calls;
  }

  if(callTarget === "last"){
    return [calls[calls.length - 1]];
  }

  if(callTarget === undefined || callTarget === "first"){
    return [calls[0]];
  }

  const index = callTarget >= 0
    ? callTarget
    : calls.length + callTarget;

  if(index < 0 || index >= calls.length){
    return [];
  }

  return [calls[index]];
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
  const closingBraces = raw.trim().startsWith("}") ? "}" : undefined;
  const openingBraces = raw.trim().endsWith("${") ? "${" : undefined;

  return {
    closingBraces,
    openingBraces
  };
}

function getIsInterpolated(ctx: Rule.RuleContext, raw: string): boolean {
  const braces = getBracesByString(ctx, raw);
  return !!braces.closingBraces || !!braces.openingBraces;
}

function getESMatcherFunctions(matchers: SelectorMatcher[]): MatcherFunctions<ESNode> {
  return matchers.reduce<MatcherFunctions<ESNode>>((matcherFunctions, matcher) => {
    switch (matcher.type){
      case MatcherType.String: {
        matcherFunctions.push((node): node is ESNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||

            isInsideBinaryExpression(node) ||
            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isIndexedAccessLiteral(node) ||

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

            isInsideBinaryExpression(node) ||
            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isInsideMemberExpression(node) ||
            isIndexedAccessLiteral(node)){
            return false;
          }

          const path = getESObjectPath(node);

          if(!path || !matcher.path){
            return true;
          }

          return matchesPathPattern(path, matcher.path);
        });
        break;
      }
      case MatcherType.ObjectValue: {
        matcherFunctions.push((node): node is ESNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||
            !isInsideObjectValue(node) ||

            isInsideBinaryExpression(node) ||
            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isESObjectKey(node) ||
            isIndexedAccessLiteral(node) ||

            !isESStringLike(node)){
            return false;
          }

          const path = getESObjectPath(node);

          if(!path || !matcher.path){
            return true;
          }

          return matchesPathPattern(path, matcher.path);
        });
        break;
      }
    }
    return matcherFunctions;
  }, []);
}
