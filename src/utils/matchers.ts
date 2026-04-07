import {
  hasESNodeParentExtension,
  isESArrowFunctionExpression,
  isESCallExpression,
  isESFunctionDeclaration,
  isESFunctionExpression,
  isESNode,
  isESSimpleStringLiteral,
  isESVariableDeclarator
} from "better-tailwindcss:parsers/es.js";
import { getCachedRegex } from "better-tailwindcss:utils/regex.js";
import { isGenericNodeWithParent } from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";
import type { Node as ESNode } from "estree";

import type { AttributeMatchers, AttributeName, Attributes } from "better-tailwindcss:options/schemas/attributes.js";
import type { CalleeMatchers, CalleeName, Callees } from "better-tailwindcss:options/schemas/callees.js";
import type { TagMatchers, TagName, Tags } from "better-tailwindcss:options/schemas/tags.js";
import type { VariableMatchers, VariableName, Variables } from "better-tailwindcss:options/schemas/variables.js";
import type { WithParent } from "better-tailwindcss:types/estree.js";
import type { MatcherFunction, MatcherFunctions } from "better-tailwindcss:types/rule.js";
import type { GenericNodeWithParent } from "better-tailwindcss:utils/utils.js";


export const UNCROSSABLE_BOUNDARY = "UNCROSSABLE_BOUNDARY";

export function getLiteralNodesByMatchers<Node>(ctx: Rule.RuleContext, node: unknown, matcherFunctions: MatcherFunctions<Node>): Node[] {
  if(!isGenericNodeWithParent(node)){ return []; }

  const nestedLiterals = findMatchingNestedNodes<Node>(node, matcherFunctions);

  for(const matcherFunction of matcherFunctions){
    try {
      if(nodeMatches(node, matcherFunction)){
        return [...nestedLiterals, node];
      }
    } catch (error){
      if(error !== UNCROSSABLE_BOUNDARY){
        throw error;
      }
    }
  }

  return nestedLiterals;
}

export function getESMatcherDeadEnd(allowFunctionTraversal = false): (node: unknown) => boolean {
  return value => {
    if(!isESNode(value)){
      return false;
    }

    if(isESCallExpression(value) || isESVariableDeclarator(value)){
      return true;
    }

    if(!allowFunctionTraversal && (isESArrowFunctionExpression(value) || isESFunctionExpression(value))){
      return true;
    }

    return false;
  };
}

function findMatchingNestedNodes<Node>(node: GenericNodeWithParent, matcherFunctions: MatcherFunctions<Node>): Node[] {
  return Object.entries(node).reduce<Node[]>((matchedNodes, [key, value]) => {
    if(!value || typeof value !== "object" || key === "parent"){
      return matchedNodes;
    }

    const currentMatcherFunctions = [...matcherFunctions];

    for(const matcherFunction of currentMatcherFunctions){
      try {
        if(nodeMatches(value, matcherFunction)){
          matchedNodes.push(value);
        }
      } catch (error){
        if(error === UNCROSSABLE_BOUNDARY){
          currentMatcherFunctions.splice(currentMatcherFunctions.indexOf(matcherFunction), 1);
        } else {
          throw error;
        }
      }
    }

    matchedNodes.push(...findMatchingNestedNodes(value, currentMatcherFunctions));
    return matchedNodes;
  }, []);
}

export function findMatchingParentNodes<Node>(node: Partial<GenericNodeWithParent>, matcherFunctions: MatcherFunctions<Node>): Node[] {
  if(!isGenericNodeWithParent(node)){ return []; }

  const currentMatcherFunctions = [...matcherFunctions];

  for(const matcherFunction of currentMatcherFunctions){
    try {
      if(nodeMatches(node.parent, matcherFunction)){
        return [node.parent];
      }
    } catch (error){
      if(error === UNCROSSABLE_BOUNDARY){
        currentMatcherFunctions.splice(currentMatcherFunctions.indexOf(matcherFunction), 1);
      } else {
        throw error;
      }
    }
  }

  return findMatchingParentNodes(node.parent, currentMatcherFunctions);
}

function nodeMatches<Node>(node: unknown, matcherFunction: MatcherFunction<Node>): node is Node {
  return matcherFunction(node);
}

export function matchesPathPattern(path: string, pattern: string): boolean {
  return getCachedRegex(pattern).test(path);
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

export function isInsideConditionalExpressionTest(node: WithParent<ESNode>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "ConditionalExpression" && node.parent.test === node){ return true; }
  return isInsideConditionalExpressionTest(node.parent);
}

export function isInsideDisallowedBinaryExpression(node: WithParent<ESNode>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(
    node.parent.type === "BinaryExpression" &&
    node.parent.operator !== "+" // allow string concatenation
  ){ return true; }
  return isInsideDisallowedBinaryExpression(node.parent);
}

export function isInsideLogicalExpressionLeft(node: WithParent<ESNode>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "LogicalExpression" && node.parent.left === node){ return true; }
  return isInsideLogicalExpressionLeft(node.parent);
}

export function isInsideMemberExpression(node: WithParent<ESNode>): boolean {
  // aka indexed access: https://github.com/estree/estree/blob/master/es5.md#memberexpression
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type === "MemberExpression"){ return true; }
  return isInsideMemberExpression(node.parent);
}

export function isIndexedAccessLiteral(node: WithParent<ESNode>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }
  if(node.parent.type !== "MemberExpression"){ return false; }
  return node.parent.property === node && isESSimpleStringLiteral(node);
}

export function isInsideAnonymousFunction(node: WithParent<ESNode>): boolean {
  if(!hasESNodeParentExtension(node)){ return false; }

  if(isESArrowFunctionExpression(node.parent)){
    return true;
  }

  if(isESFunctionExpression(node.parent)){
    if(node.parent.id === null){
      return true;
    } else {
      return false;
    }
  }

  if(isESFunctionDeclaration(node.parent)){
    return false;
  }

  return isInsideAnonymousFunction(node.parent);
}
