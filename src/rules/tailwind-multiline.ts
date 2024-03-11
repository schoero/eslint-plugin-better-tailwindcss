import { getAttributesByHTMLTag, getLiteralsByHTMLClassAttribute } from "src/parsers/html.js";
import { getAttributesBySvelteTag, getLiteralsBySvelteClassAttribute } from "src/parsers/svelte.js";
import { getAttributesByVueStartTag, getLiteralsByVueClassAttribute } from "src/parsers/vue.js";

import { getLiteralsByESCallExpression, getLiteralsByESVariableDeclarator } from "readable-tailwind:parsers:es.js";
import { getJSXAttributes, getLiteralsByJSXClassAttribute } from "readable-tailwind:parsers:jsx";
import { DEFAULT_CALLEE_NAMES, DEFAULT_CLASS_NAMES, DEFAULT_VARIABLE_NAMES } from "readable-tailwind:utils:config.js";
import { findLineStartPosition, findLiteralStartPosition } from "readable-tailwind:utils:utils";
import { splitClasses } from "readable-tailwind:utils:utils.js";

import type { TagNode } from "es-html-parser";
import type { Rule } from "eslint";
import type { CallExpression, Node, VariableDeclarator } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import type { SvelteStartTag } from "svelte-eslint-parser/lib/ast/index.js";
import type { VStartTag } from "vue-eslint-parser/ast";

import type { Literal, Meta } from "readable-tailwind:types:ast.js";
import type { Callees, ESLintRule, Variables } from "readable-tailwind:types:rule.js";


export type Options = [
  {
    callees?: Callees;
    classAttributes?: string[];
    classesPerLine?: number;
    group?: "emptyLine" | "never" | "newLine";
    indent?: number | "tab";
    lineBreakStyle?: "unix" | "windows";
    printWidth?: number;
    trim?: boolean;
    variables?: Variables;
  }
];

export const tailwindMultiline: ESLintRule<Options> = {
  name: "multiline" as const,
  rule: {
    create(ctx) {

      const { callees, classAttributes, variables } = getOptions(ctx);

      const callExpression = {
        CallExpression(node: Node) {
          const callExpressionNode = node as CallExpression;

          const literals = getLiteralsByESCallExpression(ctx, callExpressionNode, callees);
          lintLiterals(ctx, literals);
        }
      };

      const variableDeclarators = {
        VariableDeclarator(node: Node) {
          const variableDeclaratorNode = node as VariableDeclarator;

          const literals = getLiteralsByESVariableDeclarator(ctx, variableDeclaratorNode, variables);
          lintLiterals(ctx, literals);
        }
      };

      const jsx = {
        JSXOpeningElement(node: Node) {
          const jsxNode = node as JSXOpeningElement;
          const jsxAttributes = getJSXAttributes(ctx, classAttributes, jsxNode);

          for(const jsxAttribute of jsxAttributes){

            const attributeValue = jsxAttribute.value;
            const attributeName = jsxAttribute.name.name;

            if(!attributeValue){ continue; }
            if(typeof attributeName !== "string"){ continue; }

            const literals = getLiteralsByJSXClassAttribute(ctx, jsxAttribute);
            lintLiterals(ctx, literals);
          }
        }
      };

      const svelte = {
        SvelteStartTag(node: Node) {
          const svelteNode = node as unknown as SvelteStartTag;
          const svelteAttributes = getAttributesBySvelteTag(ctx, classAttributes, svelteNode);

          for(const svelteAttribute of svelteAttributes){
            const attributeName = svelteAttribute.key.name;

            if(typeof attributeName !== "string"){ continue; }

            const literals = getLiteralsBySvelteClassAttribute(ctx, svelteAttribute);
            lintLiterals(ctx, literals);
          }
        }
      };

      const vue = {
        VStartTag(node: Node) {
          const vueNode = node as unknown as VStartTag;
          const vueAttributes = getAttributesByVueStartTag(ctx, classAttributes, vueNode);

          for(const attribute of vueAttributes){
            const literals = getLiteralsByVueClassAttribute(ctx, attribute);
            lintLiterals(ctx, literals);
          }
        }
      };

      const html = {
        Tag(node: Node) {
          const htmlTagNode = node as unknown as TagNode;
          const htmlAttributes = getAttributesByHTMLTag(ctx, classAttributes, htmlTagNode);

          for(const htmlAttribute of htmlAttributes){
            const literals = getLiteralsByHTMLClassAttribute(ctx, htmlAttribute);
            lintLiterals(ctx, literals);
          }
        }
      };

      // Vue
      if(typeof ctx.parserServices?.defineTemplateBodyVisitor === "function"){
        return {
          ...callExpression,
          ...variableDeclarators,
          ...ctx.parserServices.defineTemplateBodyVisitor(vue)
        };
      }

      return {
        ...callExpression,
        ...variableDeclarators,
        ...jsx,
        ...svelte,
        ...vue,
        ...html
      };

    },
    meta: {
      docs: {
        category: "Stylistic Issues",
        description: "Enforce consistent line wrapping for tailwind classes.",
        recommended: true,
        url: "https://github.com/schoero/eslint-plugin-readable-tailwind/blob/main/docs/rules/multiline.md"
      },
      fixable: "code",
      schema: [
        {
          additionalProperties: false,
          properties: {
            callees: {
              default: getOptions().callees,
              description: "List of function names whose arguments should also be considered.",
              items: {
                anyOf: [
                  {
                    description: "List of regular expressions that matches string literals that should also be considered.",
                    items: [
                      { description: "Regular expression that filters the callee and matches the string literals in a group.", type: "string" },
                      { description: "Regular expression that matches each string literal in a group.", type: "string" }
                    ],
                    type: "array"
                  },
                  {
                    description: "List of function names whose arguments should also be considered.",
                    type: "string"
                  }
                ]
              },
              type: "array"
            },
            classAttributes: {
              default: getOptions().classAttributes,
              description: "The name of the attribute that contains the tailwind classes.",
              items: {
                type: "string"
              },
              type: "array"
            },
            classesPerLine: {
              default: getOptions().classesPerLine,
              description: "The maximum amount of classes per line. Lines are wrapped appropriately to stay within this limit . The value `0` disables line wrapping by `classesPerLine`.",
              type: "integer"
            },
            group: {
              default: getOptions().group,
              description: "The group separator.",
              enum: ["emptyLine", "never", "newLine"],
              type: "string"
            },
            indent: {
              default: getOptions().indent,
              description: "Determines how the code should be indented.",
              oneOf: [
                {
                  enum: ["tab"],
                  type: "string"
                },
                {
                  minimum: 0,
                  type: "integer"
                }
              ],
              type: "integer"

            },
            lineBreakStyle: {
              default: getOptions().lineBreakStyle,
              description: "The line break style. The style `windows` will use `\\r\\n` as line breaks and `unix` will use `\\n`.",
              enum: ["unix", "windows"],
              type: "string"
            },
            printWidth: {
              default: getOptions().printWidth,
              description: "The maximum line length. Lines are wrapped appropriately to stay within this limit. The value `0` disables line wrapping by `printWidth`.",
              type: "integer"
            },
            variables: {
              default: getOptions().variables,
              description: "List of variable names whose values should also be considered.",
              items: {
                anyOf: [
                  {
                    description: "List of regular expressions that matches string literals that should also be considered.",
                    items: [
                      { description: "Regular expression that filters the variable and matches the string literals in a group.", type: "string" },
                      { description: "Regular expression that matches each string literal in a group.", type: "string" }
                    ],
                    type: "array"
                  },
                  {
                    description: "List of variable names whose values should also be considered.",
                    type: "string"
                  }
                ]
              },
              type: "array"
            }
          },
          type: "object"
        }
      ],
      type: "layout"
    }
  }
};

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const { classesPerLine, group: groupSeparator, indent, lineBreakStyle, printWidth } = getOptions(ctx);

  for(const literal of literals){

    const lineStartPosition = literal.type === "TemplateLiteral"
      ? findLineStartPosition(ctx, literal.parent) + getIndentation(ctx, indent)
      : findLineStartPosition(ctx, literal) + getIndentation(ctx, indent);

    const literalStartPosition = findLiteralStartPosition(ctx, literal);

    const classChunks = splitClasses(literal.content);
    const groupedClasses = groupClasses(ctx, classChunks);

    const lines = new Lines(ctx, lineStartPosition);

    if(literal.openingQuote){
      if(
        literal.parent.type === "JSXAttribute" ||
        literal.parent.type === "JSXExpressionContainer" ||
        literal.parent.type === "Property" ||
        literal.parent.type === "CallExpression" ||
        literal.parent.type === "SvelteMustacheTag" ||
        literal.parent.type === "VariableDeclarator"){
        lines.line.addMeta({ openingQuote: "`" });
      } else {
        lines.line.addMeta({ openingQuote: literal.openingQuote });
      }
    }

    if(literal.type === "TemplateLiteral" && literal.closingBraces){
      lines.line.addMeta({ closingBraces: literal.closingBraces });
    }

    if(groupedClasses){

      for(const group of groupedClasses.groups){

        const isFirstGroup = groupedClasses.groups.indexOf(group) === 0;

        if(group.classCount === 0){
          continue;
        }

        if((
          literal.type === "TemplateLiteral" && !literal.closingBraces ||
          literal.type !== "TemplateLiteral"
        ) && isFirstGroup){
          lines.addLine();
          lines.line.indent();
        }

        if(isFirstGroup && literal.type === "TemplateLiteral" && literal.closingBraces || !isFirstGroup){

          if(groupSeparator === "emptyLine"){
            lines.addLine();
          }

          if(groupSeparator === "emptyLine" || groupSeparator === "newLine"){
            lines.addLine();
            lines.line.indent();
          }

        }

        for(const className of group.classes){

          const simulatedLine = lines.line
            .clone()
            .addClass(className)
            .toString();

          if(
            simulatedLine.length > printWidth && printWidth !== 0 ||
            lines.line.classCount >= classesPerLine && classesPerLine !== 0
          ){
            lines.addLine();
            lines.line.indent();
          }

          lines.line.addClass(className);

        }
      }
    }

    if(literal.type === "TemplateLiteral" && literal.openingBraces){

      if(groupSeparator === "emptyLine" && groupedClasses){ lines.addLine(); }

      lines.addLine();
      lines.line.indent();
      lines.line.addMeta({ openingBraces: literal.openingBraces });

    }

    if(literal.closingQuote){
      lines.addLine();
      lines.line.indent(lineStartPosition - getIndentation(ctx, indent));

      if(
        literal.parent.type === "JSXAttribute" ||
        literal.parent.type === "JSXExpressionContainer" ||
        literal.parent.type === "Property" ||
        literal.parent.type === "CallExpression" ||
        literal.parent.type === "SvelteMustacheTag" ||
        literal.parent.type === "VariableDeclarator"){
        lines.line.addMeta({ closingQuote: "`" });
      } else {
        lines.line.addMeta({ closingQuote: literal.closingQuote });
      }
    }

    // collapse lines if there is no reason for line wrapping
    collapse: if(lines.length === 3){

      // disallow collapsing if the first line contains more classes than the classesPerLine
      if(lines.at(1).classCount > classesPerLine && classesPerLine !== 0){
        break collapse;
      }

      // disallow collapsing if the first line including the element and all previous characters is longer than the printWidth
      if(literalStartPosition + lines.at(1).length > printWidth && printWidth !== 0){
        break collapse;
      }

      // disallow collapsing if the literal contains expressions
      if(literal.type === "TemplateLiteral" && (literal.openingBraces || literal.closingBraces)){
        break collapse;
      }

      // add quotes from the first and last line to the second line
      lines.at(1).addMeta({
        closingQuote: literal.closingQuote,
        openingQuote: literal.openingQuote
      });

      const fixedClasses = lines.at(1).toString(false);

      if(literal.raw === fixedClasses){
        continue;
      }

      ctx.report({
        data: {
          notReadable: literal.content
        },
        fix(fixer) {
          return fixer.replaceTextRange(literal.range, fixedClasses);
        },
        loc: literal.loc,
        message: "Unnecessary line wrapping: \"{{ notReadable }}\"."
      });

      return;

    }

    // skip if class string was empty
    if(lines.length === 2){
      if(!literal.openingBraces && !literal.closingBraces && literal.content.trim() === ""){
        continue;
      }
    }

    // skip line wrapping if it is not necessary
    skip: if(lines.length === 3){

      // disallow skipping for template literals with braces
      if(literal.type === "TemplateLiteral" && (literal.openingBraces || literal.closingBraces)){
        break skip;
      }

      const openingQuoteLength = literal.openingQuote?.length ?? 0;
      const closingBracesLength = literal.closingBraces?.length ?? 0;

      const firstLineLength = lines
        .at(1)
        .toString()
        .trim()
        .length +
        openingQuoteLength +
        closingBracesLength;

      // disallow skipping if the first line including the element and all previous characters is longer than the printWidth
      if(literalStartPosition + firstLineLength > printWidth && printWidth !== 0){
        break skip;
      }

      // disallow skipping if the first line contains more classes than the classesPerLine
      if(lines.at(1).classCount > classesPerLine && classesPerLine !== 0){
        break skip;
      }

      continue;

    }

    const fixedClasses = lines.toString(lineBreakStyle);

    if(literal.raw === fixedClasses){
      continue;
    }

    ctx.report({
      data: {
        notReadable: literal.content
      },
      fix(fixer) {
        return literal.parent.type === "JSXAttribute"
          ? fixer.replaceTextRange(literal.range, `{${fixedClasses}}`)
          : fixer.replaceTextRange(literal.range, fixedClasses);
      },
      loc: literal.loc,
      message: "Missing line wrapping: \"{{ notReadable }}\"."
    });

  }

}

function getIndentation(ctx: Rule.RuleContext, indentation: Options[0]["indent"]): number {
  return indentation === "tab" ? 1 : indentation ?? 0;
}

function getOptions(ctx?: Rule.RuleContext) {

  const options: Options[0] = ctx?.options[0] ?? {};

  const printWidth = options.printWidth ?? 80;
  const classesPerLine = options.classesPerLine ?? 0;
  const indent = options.indent ?? 2;
  const group = options.group ?? "emptyLine";

  const classAttributes = options.classAttributes ?? DEFAULT_CLASS_NAMES;
  const callees = options.callees ?? DEFAULT_CALLEE_NAMES;
  const variables = options.variables ?? DEFAULT_VARIABLE_NAMES;
  const lineBreakStyle = options.lineBreakStyle ?? "unix";

  return {
    callees,
    classAttributes,
    classesPerLine,
    group,
    indent,
    lineBreakStyle,
    printWidth,
    variables
  };

}


class Lines {

  private lines: Line[] = [];
  private currentLine: Line | undefined;
  private indentation = 0;
  private ctx: Rule.RuleContext;

  constructor(ctx: Rule.RuleContext, indentation: number) {
    this.ctx = ctx;
    this.indentation = indentation;

    this.addLine();
  }

  public at(index: number) {
    return index >= 0
      ? this.lines[index]
      : this.lines[this.lines.length + index];
  }

  public get line() {
    return this.currentLine!;
  }

  public get length() {
    return this.lines.length;
  }

  public addLine() {
    const line = new Line(this.ctx, this.indentation);
    this.lines.push(line);
    this.currentLine = line;
    return this;
  }

  public toString(lineBreakStyle: Options[0]["lineBreakStyle"] = "unix") {
    const lineBreaks = lineBreakStyle === "unix" ? "\n" : "\r\n";

    return this.lines.map(
      line => line.toString()
    ).join(lineBreaks);
  }
}

class Line {

  private classes: string[] = [];
  private meta: Meta = {};
  private ctx: Rule.RuleContext;
  private indentation = 0;

  constructor(ctx: Rule.RuleContext, indentation: number) {
    this.ctx = ctx;
    this.indentation = indentation;
  }

  public indent(start: number = this.indentation) {
    const indent = getOptions(this.ctx).indent;

    if(indent === "tab"){
      this.meta.indentation = "\t".repeat(start);
    } else {
      this.meta.indentation = " ".repeat(start);
    }

    return this;
  }

  public get length() {
    return this.toString().length;
  }

  public get classCount() {
    return this.classes.length;
  }

  public get printWidth() {
    return this.toString().length;
  }

  public addMeta({ closingBraces, closingQuote, openingBraces, openingQuote }: Meta) {
    this.meta = { ...this.meta, closingBraces, closingQuote, openingBraces, openingQuote };
    return this;
  }

  public addClass(className: string) {
    this.classes.push(className);
    return this;
  }

  public clone() {
    const line = new Line(this.ctx, this.indentation);
    line.classes = [...this.classes];
    line.meta = { ...this.meta };
    return line;
  }

  public toString(indent: boolean = true) {
    return this.join([
      indent
        ? this.meta.indentation
        : "",
      this.meta.openingQuote,
      this.join([
        this.meta.closingBraces,
        ...this.classes,
        this.meta.openingBraces
      ]),
      this.meta.closingQuote
    ], "");
  }

  private join(content: (string | undefined)[], separator: string = " ") {
    return content
      .filter(content => content !== undefined)
      .join(separator);
  }
}

function groupClasses(ctx: Rule.RuleContext, classes: string[]) {

  if(classes.length === 0){
    return;
  }

  const groups = new Groups();

  for(const className of classes){

    const isFirstClass = classes.indexOf(className) === 0;
    const isFirstGroup = groups.length === 1;

    const lastGroup = groups.at(-1);
    const lastClass = lastGroup?.at(-1);
    const lastModifier = lastClass?.match(/^.*?:/)?.[0];
    const modifier = className.match(/^.*?:/)?.[0];

    if(lastModifier !== modifier && !(isFirstClass && isFirstGroup)){
      groups.addGroup();
    }

    groups.group.addClass(className);

  }

  return groups;

}

class Groups {

  public readonly groups: Group[] = [];
  private currentGroup: Group | undefined;

  constructor() {
    this.addGroup();
  }

  public get group() {
    return this.currentGroup!;
  }

  public at(index: number) {
    return this.groups.at(index);
  }

  public get length() {
    return this.groups.length;
  }

  public addGroup() {
    const group = new Group();
    this.currentGroup = group;
    this.groups.push(this.currentGroup);
    return this;
  }
}

class Group {

  public readonly classes: string[] = [];

  public get classCount() {
    return this.classes.length;
  }

  public at(index: number) {
    return this.classes.at(index);
  }

  public addClass(className: string) {
    this.classes.push(className);
    return this;
  }
}
