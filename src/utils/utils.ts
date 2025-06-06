import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";
import { isAttributesRegex, isCalleeRegex, isVariableRegex } from "better-tailwindcss:utils/matchers.js";

import type { Rule } from "eslint";

import type { BracesMeta, Literal, QuoteMeta } from "better-tailwindcss:types/ast.js";


export function getCommonOptions(ctx: Rule.RuleContext) {

  const attributes = getOption(ctx, "attributes") ?? DEFAULT_ATTRIBUTE_NAMES;
  const callees = getOption(ctx, "callees") ?? DEFAULT_CALLEE_NAMES;
  const variables = getOption(ctx, "variables") ?? DEFAULT_VARIABLE_NAMES;
  const tags = getOption(ctx, "tags") ?? DEFAULT_TAG_NAMES;
  const tailwindConfig = getOption(ctx, "entryPoint") ?? getOption(ctx, "tailwindConfig");

  if(isAttributesRegex(attributes) || isCalleeRegex(callees) || isVariableRegex(variables)){
    console.warn("⚠️ Warning: Regex matching is deprecated and will be removed in the next major version. Please use matchers instead.");
  }

  return {
    attributes,
    callees,
    tags,
    tailwindConfig,
    variables
  };
}

function getOption(ctx: Rule.RuleContext, key: string) {
  return ctx.options[0]?.[key] ?? ctx.settings["eslint-plugin-better-tailwindcss"]?.[key] ??
    ctx.settings["better-tailwindcss"]?.[key];
}

export function getWhitespace(classes: string) {
  const leadingWhitespace = classes.match(/^\s*/)?.[0];
  const trailingWhitespace = classes.match(/\s*$/)?.[0];

  return { leadingWhitespace, trailingWhitespace };
}

export function getQuotes(raw: string): QuoteMeta {
  const openingQuote = raw.at(0);
  const closingQuote = raw.at(-1);

  return {
    closingQuote: closingQuote === "'" || closingQuote === '"' || closingQuote === "`" ? closingQuote : undefined,
    openingQuote: openingQuote === "'" || openingQuote === '"' || openingQuote === "`" ? openingQuote : undefined
  };
}

export function getContent(raw: string, quotes?: QuoteMeta, braces?: BracesMeta) {
  return raw.substring(
    (quotes?.openingQuote?.length ?? 0) + (braces?.closingBraces?.length ?? 0),
    raw.length - (quotes?.closingQuote?.length ?? 0) - (braces?.openingBraces?.length ?? 0)
  );
}

export function splitClasses(classes: string): string[] {
  if(classes.trim() === ""){
    return [];
  }

  return classes
    .trim()
    .split(/\s+/);
}

export function display(classes: string): string {
  return classes
    .replaceAll(" ", "·")
    .replaceAll("\n", "↵\n")
    .replaceAll("\r", "↩\r")
    .replaceAll("\t", "→");
}

export interface Warning<Options extends Record<string, any> = Record<string, any>> {
  option: keyof Options;
  title: string;
  url: string;
}

export function augmentMessageWithWarnings(message: string, warnings?: Warning[]) {
  if(!warnings || warnings.length === 0){
    return message;
  }

  return [
    warnings.flatMap(({ option, title, url }) => [
      `⚠️ Warning: ${title}. Option \`${option}\` may be misconfigured.`,
      `Check documentation at ${url}`
    ]).join("\n"),
    message
  ].join("\n\n");
}

export function splitWhitespaces(classes: string): string[] {
  return classes.split(/\S+/);
}

export function getIndentation(line: string): number {
  return line.match(/^[\t ]*/)?.[0].length ?? 0;
}

export function escapeForRegex(word: string) {
  return word.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&");
}

export function getExactClassLocation(literal: Literal, className: string, partial: boolean = false, lastIndex: boolean = false) {
  const escapedClass = escapeForRegex(className);

  const regex = partial
    ? new RegExp(`(${escapedClass})`, "g")
    : new RegExp(`(?:^|\\s+)(${escapedClass})(?=\\s+|$)`, "g");

  const [...matches] = literal.content.matchAll(regex);

  const match = lastIndex ? matches.at(-1) : matches.at(0);

  if(match?.index === undefined){
    return literal.loc;
  }

  const fullMatchIndex = match.index;
  const word = match?.[1];
  const indexOfClass = fullMatchIndex + match[0].indexOf(word);

  const linesUpToStartIndex = literal.content.slice(0, indexOfClass).split("\n");
  const isOnFirstLine = linesUpToStartIndex.length === 1;
  const containingLine = linesUpToStartIndex.at(-1);

  const line = literal.loc.start.line + linesUpToStartIndex.length - 1;
  const column = (
    isOnFirstLine
      ? literal.loc.start.column + (literal.openingQuote?.length ?? 0)
      : 0
  ) + (containingLine?.length ?? 0);

  return {
    end: {
      column: column + className.length,
      line
    },
    start: {
      column,
      line
    }
  };
}

export function matchesName(pattern: string, name: string | undefined): boolean {
  if(!name){ return false; }

  const match = name.match(pattern);
  return !!match && match[0] === name;
}

export function deduplicateLiterals(literals: Literal[]): Literal[] {
  return literals.filter((l1, index) => {
    return literals.findIndex(l2 => {
      return l1.content === l2.content &&
        l1.range[0] === l2.range[0] &&
        l1.range[1] === l2.range[1];
    }) === index;
  });
}

export interface GenericNodeWithParent {
  parent: GenericNodeWithParent;
}

export function isGenericNodeWithParent(node: unknown): node is GenericNodeWithParent {
  return (
    typeof node === "object" &&
    node !== null &&
    "parent" in node &&
    node.parent !== null &&
    typeof node.parent === "object"
  );
}
