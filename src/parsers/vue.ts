import {
  ES_CONTAINER_TYPES_TO_INSERT_BRACES,
  ES_CONTAINER_TYPES_TO_REPLACE_QUOTES,
  getESObjectPath,
  getLiteralsByESLiteralNode,
  hasESNodeParentExtension,
  isESNode,
  isESObjectKey,
  isESStringLike,
  isInsideObjectValue
} from "better-tailwindcss:parsers/es.js";
import { MatcherType } from "better-tailwindcss:types/rule.js";
import {
  getLiteralNodesByMatchers,
  isAttributesMatchers,
  isAttributesName,
  isInsideConditionalExpressionTest,
  isInsideLogicalExpressionLeft,
  isInsideMemberExpression,
  matchesPathPattern
} from "better-tailwindcss:utils/matchers.js";
import {
  deduplicateLiterals,
  getContent,
  getIndentation,
  getQuotes,
  getWhitespace,
  matchesName
} from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";
import type { BaseNode as ESBaseNode, Node as ESNode } from "estree";
import type { AST } from "vue-eslint-parser";
import type { VLiteral } from "vue-eslint-parser/ast/index";

import type { Attributes } from "better-tailwindcss:options/schemas/attributes.js";
import type { Literal, LiteralValueQuotes, MultilineMeta, StringLiteral } from "better-tailwindcss:types/ast.js";
import type { Context, Matcher, MatcherFunctions } from "better-tailwindcss:types/rule.js";


export const VUE_CONTAINER_TYPES_TO_REPLACE_QUOTES = [
  ...ES_CONTAINER_TYPES_TO_REPLACE_QUOTES
];

export const VUE_CONTAINER_TYPES_TO_INSERT_BRACES = [
  ...ES_CONTAINER_TYPES_TO_INSERT_BRACES
];


export function getAttributesByVueStartTag(ctx: Context, node: AST.VStartTag): (AST.VAttribute | AST.VDirective)[] {
  return node.attributes;
}

export function getLiteralsByVueAttribute(ctx: Context, attribute: AST.VAttribute | AST.VDirective, attributes: Attributes): Literal[] {

  if(attribute.value === null){
    return [];
  }

  const value = attribute.value;

  const literals = attributes.reduce<Literal[]>((literals, attributes) => {
    if(isAttributesName(attributes)){
      if(!matchesName(getVueBoundName(attributes).toLowerCase(), getVueAttributeName(attribute)?.toLowerCase())){ return literals; }
      literals.push(...getLiteralsByVueLiteralNode(ctx, value));
    } else if(isAttributesMatchers(attributes)){
      if(!matchesName(getVueBoundName(attributes[0]).toLowerCase(), getVueAttributeName(attribute)?.toLowerCase())){ return literals; }
      literals.push(...getLiteralsByVueMatchers(ctx, value, attributes[1]));
    }

    return literals;
  }, []);

  return deduplicateLiterals(literals);

}

function getLiteralsByVueLiteralNode(ctx: Context, node: ESBaseNode): Literal[] {

  if(!hasESNodeParentExtension(node)){ return []; }

  if(isVueLiteralNode(node)){
    const literal = getStringLiteralByVueStringLiteral(ctx, node);
    return [literal];
  }

  if(isESStringLike(node)){
    return getLiteralsByVueESLiteralNode(ctx, node);
  }

  return [];
}

function getLiteralsByVueMatchers(ctx: Context, node: ESBaseNode, matchers: Matcher[]): Literal[] {
  const matcherFunctions = getVueMatcherFunctions(matchers);
  const literalNodes = getLiteralNodesByMatchers(ctx, node, matcherFunctions);
  const literals = literalNodes.flatMap(literalNode => getLiteralsByVueLiteralNode(ctx, literalNode));
  return deduplicateLiterals(literals);
}

function getLiteralsByVueESLiteralNode(ctx: Context, node: ESBaseNode & Rule.NodeParentExtension): Literal[] {
  const literals = getLiteralsByESLiteralNode(ctx, node);

  return literals.map(literal => {
    const multilineQuotes = getMultilineQuotes(node);

    return {
      ...literal,
      ...multilineQuotes
    };
  });
}

function getStringLiteralByVueStringLiteral(ctx: Context, node: AST.VLiteral): StringLiteral {

  const raw = ctx.sourceCode.getText(node as unknown as ESNode);
  const line = ctx.sourceCode.lines[node.loc.start.line - 1];

  const quotes = getQuotes(raw);
  const content = getContent(raw, quotes);
  const whitespaces = getWhitespace(content);
  const indentation = getIndentation(line);
  const multilineQuotes = getMultilineQuotes(node);

  return {
    ...whitespaces,
    ...quotes,
    ...multilineQuotes,
    content,
    indentation,
    loc: node.loc,
    priorLiterals: [],
    range: [node.range[0], node.range[1]],
    raw,
    supportsMultiline: true,
    type: "StringLiteral"
  };

}

function getMultilineQuotes(node: ESBaseNode & Rule.NodeParentExtension | VLiteral): MultilineMeta {
  const surroundingBraces = VUE_CONTAINER_TYPES_TO_INSERT_BRACES.includes(node.parent.type);
  const multilineQuotes: LiteralValueQuotes[] = VUE_CONTAINER_TYPES_TO_REPLACE_QUOTES.includes(node.parent.type)
    ? ["`"]
    : [];

  return {
    multilineQuotes,
    surroundingBraces
  };
}

function getVueBoundName(name: string): string {
  return name.startsWith(":") ? `v-bind:${name.slice(1)}` : name;
}

function getVueAttributeName(attribute: AST.VAttribute | AST.VDirective): string | undefined {
  if(isVueAttribute(attribute)){
    return attribute.key.name;
  }

  if(isVueDirective(attribute)){
    if(attribute.key.argument?.type === "VIdentifier"){
      return `v-${attribute.key.name.name}:${attribute.key.argument.name}`;
    }
  }
}

function isVueAttribute(attribute: AST.VAttribute | AST.VDirective): attribute is AST.VAttribute {
  return attribute.key.type === "VIdentifier";
}

function isVueDirective(attribute: AST.VAttribute | AST.VDirective): attribute is AST.VDirective {
  return attribute.key.type === "VDirectiveKey";
}

function isVueLiteralNode(node: ESBaseNode): node is AST.VLiteral {
  return node.type === "VLiteral";
}

function getVueMatcherFunctions(matchers: Matcher[]): MatcherFunctions<ESBaseNode> {
  return matchers.reduce<MatcherFunctions<ESBaseNode>>((matcherFunctions, matcher) => {
    switch (matcher.match){
      case MatcherType.String: {
        matcherFunctions.push((node): node is ESBaseNode => {

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

          return isESStringLike(node) || isVueLiteralNode(node);
        });
        break;
      }
      case MatcherType.ObjectKey: {
        matcherFunctions.push((node): node is ESBaseNode => {

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
        matcherFunctions.push((node): node is ESBaseNode => {

          if(
            !isESNode(node) ||
            !hasESNodeParentExtension(node) ||
            !isInsideObjectValue(node) ||

            isInsideConditionalExpressionTest(node) ||
            isInsideLogicalExpressionLeft(node) ||
            isInsideMemberExpression(node) ||
            isESObjectKey(node) ||

            !isESStringLike(node) && !isVueLiteralNode(node)){
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
