import {
  hasESNodeParentExtension,
  isESArrowFunctionExpression,
  isESCallExpression,
  isESNode,
  isESVariableDeclarator
} from "better-tailwindcss:parsers/es.js";
import { isGenericNodeWithParent } from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";
import type { Node as ESNode } from "estree";

import type { AttributeMatchers, AttributeName, Attributes } from "better-tailwindcss:options/schemas/attributes.js";
import type { CalleeMatchers, CalleeName, Callees } from "better-tailwindcss:options/schemas/callees.js";
import type { TagMatchers, TagName, Tags } from "better-tailwindcss:options/schemas/tags.js";
import type { VariableMatchers, VariableName, Variables } from "better-tailwindcss:options/schemas/variables.js";
import type { MatcherFunctions } from "better-tailwindcss:types/rule.js";
import type { GenericNodeWithParent } from "better-tailwindcss:utils/utils.js";


export function getLiteralNodesByMatchers<Node>(ctx: Rule.RuleContext, node: unknown, matcherFunctions: MatcherFunctions<Node>, deadEnd?: (node: unknown) => boolean): Node[] {
  if(!isGenericNodeWithParent(node)){ return []; }

  const nestedLiterals = findMatchingNestedNodes<Node>(node, matcherFunctions, deadEnd);
  const self = nodeMatches<Node>(node, matcherFunctions) ? [node] : [];

  return [...nestedLiterals, ...self];
}

function findMatchingNestedNodes<Node>(
  node: GenericNodeWithParent,
  matcherFunctions: MatcherFunctions<Node>,
  deadEnd: (node: unknown) => boolean = value => isESNode(value) && (isESCallExpression(value) || isESArrowFunctionExpression(value) || isESVariableDeclarator(value))
): Node[] {
  return Object.entries(node).reduce<Node[]>((matchedNodes, [key, value]) => {
    if(!value || typeof value !== "object" || key === "parent"){
      return matchedNodes;
    }

    if(deadEnd?.(value)){
      return matchedNodes;
    }

    if(nodeMatches(value, matcherFunctions)){
      matchedNodes.push(value);
    }

    matchedNodes.push(...findMatchingNestedNodes(value, matcherFunctions, deadEnd));
    return matchedNodes;
  }, []);
}

export function findMatchingParentNodes<Node>(node: GenericNodeWithParent, matcherFunctions: MatcherFunctions<Node>): Node[] {
  if(!isGenericNodeWithParent(node)){ return []; }

  if(nodeMatches(node.parent, matcherFunctions)){
    return [node.parent];
  }

  return findMatchingParentNodes(node.parent, matcherFunctions);
}

function nodeMatches<Node>(node: unknown, matcherFunctions: MatcherFunctions<Node>): node is Node {
  for(const matcherFunction of matcherFunctions){
    if(matcherFunction(node)){ return true; }
  }
  return false;
}

function isChildNodeOfNode(node: ESNode & Partial<Rule.NodeParentExtension>, parent: ESNode): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent === parent){ return true; }
  return isChildNodeOfNode(node.parent, parent);
}

export function matchesPathPattern(path: string, pattern: string): boolean {
  const regex = new RegExp(pattern);
  return regex.test(path);
}

export function isCalleeName(callee: Callees[number]): callee is CalleeName {
  return typeof callee === "string";
}

export function isCalleeMatchers(callee: Callees[number]): callee is CalleeMatchers {
  return Array.isArray(callee) && typeof callee[0] === "string" && Array.isArray(callee[1]);
}

export function isVariableName(variable: Variables[number]): variable is VariableName {
  return typeof variable === "string";
}

export function isVariableMatchers(variable: Variables[number]): variable is VariableMatchers {
  return Array.isArray(variable) && typeof variable[0] === "string" && Array.isArray(variable[1]);
}

export function isTagName(tag: Tags[number]): tag is TagName {
  return typeof tag === "string";
}

export function isTagMatchers(tag: Tags[number]): tag is TagMatchers {
  return Array.isArray(tag) && typeof tag[0] === "string" && Array.isArray(tag[1]);
}

export function isAttributesName(attributes: Attributes[number]): attributes is AttributeName {
  return typeof attributes === "string";
}

export function isAttributesMatchers(attributes: Attributes[number]): attributes is AttributeMatchers {
  return Array.isArray(attributes) && typeof attributes[0] === "string" && Array.isArray(attributes[1]);
}

export function isInsideConditionalExpressionTest(node: ESNode & Partial<Rule.NodeParentExtension>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "ConditionalExpression" && node.parent.test === node){ return true; }
  return isInsideConditionalExpressionTest(node.parent);
}

export function isInsideBinaryExpression(node: ESNode & Partial<Rule.NodeParentExtension>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "BinaryExpression"){ return true; }
  return isInsideBinaryExpression(node.parent);
}

export function isInsideLogicalExpressionLeft(node: ESNode & Partial<Rule.NodeParentExtension>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "LogicalExpression" && node.parent.left === node){ return true; }
  return isInsideLogicalExpressionLeft(node.parent);
}

export function isInsideMemberExpression(node: ESNode & Partial<Rule.NodeParentExtension>): boolean {
  // aka indexed access: https://github.com/estree/estree/blob/master/es5.md#memberexpression
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "MemberExpression"){ return true; }
  return isInsideMemberExpression(node.parent);
}
