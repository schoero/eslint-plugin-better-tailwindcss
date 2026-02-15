import {
  addAttribute,
  deduplicateLiterals,
  getContent,
  getIndentation,
  matchesName
} from "better-tailwindcss:utils/utils.js";

import type { AttributeNode, TagNode } from "es-html-parser";
import type { Rule } from "eslint";

import type { Literal, QuoteMeta } from "better-tailwindcss:types/ast.js";
import type { AttributeSelector } from "better-tailwindcss:types/rule.js";


export function getLiteralsByHTMLAttribute(ctx: Rule.RuleContext, attribute: AttributeNode, selectors: AttributeSelector[]): Literal[] {

  const name = attribute.key.value;

  const literals = selectors.reduce<Literal[]>((literals, selector) => {
    if(!matchesName(selector.name.toLowerCase(), name.toLowerCase())){ return literals; }
    if(!selector.match){
      literals.push(...getLiteralsByHTMLAttributeNode(ctx, attribute));
      return literals;
    }

    return literals;
  }, []);

  return literals
    .filter(deduplicateLiterals)
    .map(addAttribute(name));

}

export function getAttributesByHTMLTag(ctx: Rule.RuleContext, node: TagNode): AttributeNode[] {
  return node.attributes;
}

export function getLiteralsByHTMLAttributeNode(ctx: Rule.RuleContext, attribute: AttributeNode): Literal[] {

  const value = attribute.value;

  if(!value){
    return [];
  }

  const line = ctx.sourceCode.lines[attribute.loc.start.line - 1];
  const raw = attribute.startWrapper?.value + value.value + attribute.endWrapper?.value;

  const quotes = getQuotesByHTMLAttribute(ctx, attribute);
  const indentation = getIndentation(line);
  const content = getContent(raw, quotes);

  return [{
    ...quotes,
    content,
    indentation,
    isInterpolated: false,
    loc: value.loc,
    range: [value.range[0] - 1, value.range[1] + 1], // include quotes in range
    raw,
    supportsMultiline: true,
    type: "StringLiteral"
  }];

}


function getQuotesByHTMLAttribute(ctx: Rule.RuleContext, attribute: AttributeNode): QuoteMeta {
  const openingQuote = attribute.startWrapper?.value;
  const closingQuote = attribute.endWrapper?.value;

  return {
    closingQuote: closingQuote === "'" || closingQuote === '"' ? closingQuote : undefined,
    openingQuote: openingQuote === "'" || openingQuote === '"' ? openingQuote : undefined
  };
}
