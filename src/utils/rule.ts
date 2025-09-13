import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { toJsonSchema } from "@valibot/to-json-schema";
import { getDefaults, object } from "valibot";

import { COMMON_OPTIONS } from "better-tailwindcss:options/descriptions.js";
import { getAttributesByAngularElement, getLiteralsByAngularAttribute } from "better-tailwindcss:parsers/angular.js";
import {
  getLiteralsByESCallExpression,
  getLiteralsByESVariableDeclarator,
  getLiteralsByTaggedTemplateExpression
} from "better-tailwindcss:parsers/es.js";
import { getAttributesByHTMLTag, getLiteralsByHTMLAttribute } from "better-tailwindcss:parsers/html.js";
import { getAttributesByJSXElement, getLiteralsByJSXAttribute } from "better-tailwindcss:parsers/jsx.js";
import { getAttributesBySvelteTag, getLiteralsBySvelteAttribute } from "better-tailwindcss:parsers/svelte.js";
import { getAttributesByVueStartTag, getLiteralsByVueAttribute } from "better-tailwindcss:parsers/vue.js";
import { getLocByRange } from "better-tailwindcss:utils/ast.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { augmentMessageWithWarnings } from "better-tailwindcss:utils/utils.js";
import { parseSemanticVersion } from "better-tailwindcss:utils/version.js";
import { warnOnce } from "better-tailwindcss:utils/warn.js";

import type { TmplAstElement } from "@angular-eslint/bundled-angular-compiler";
import type { TagNode } from "es-html-parser";
import type { Rule } from "eslint";
import type { CallExpression, Node, TaggedTemplateExpression, VariableDeclarator } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import type { SvelteStartTag } from "svelte-eslint-parser/lib/ast/index.js";
import type { AST } from "vue-eslint-parser";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Literal } from "better-tailwindcss:types/ast.js";
import type {
  Context,
  CreateRuleOptions,
  ESLintRule,
  JsonSchema,
  RuleContext,
  Schema
} from "better-tailwindcss:types/rule.js";


export function createRule<
  const Messages extends Record<string, string>,
  const OptionsSchema extends Schema = Schema,
  const Options extends Record<string, any> = CommonOptions & JsonSchema<OptionsSchema>
>(options: CreateRuleOptions<Messages, OptionsSchema, Options>): ESLintRule<Messages, Options> {

  const { autofix, category, description, docs, initialize, lintLiterals, messages, name, recommended, schema } = options;

  let eslintContext: Rule.RuleContext | undefined;

  const propertiesSchema = object({
    ...COMMON_OPTIONS.entries,
    ...schema?.entries ?? {}
  });

  const jsonSchema = toJsonSchema(propertiesSchema).properties;

  const getOptions = () => {
    const commonOptions = getDefaults(COMMON_OPTIONS);
    const defaultOptions = schema ? getDefaults(schema) : {};
    const settings = eslintContext?.settings?.["eslint-plugin-better-tailwindcss"] ?? eslintContext?.settings?.["better-tailwindcss"] ?? {};
    const options = eslintContext?.options[0] ?? {};

    return {
      ...commonOptions,
      ...defaultOptions,
      ...settings,
      ...options
    };
  };

  return {
    messages,
    name,
    get options() { return getOptions(); },
    rule: {
      create: ctx => {

        eslintContext = ctx;

        const options = getOptions();

        const { entryPoint, tailwindConfig, tsconfig } = options;

        const projectDirectory = resolve(ctx.cwd, entryPoint ?? tailwindConfig ?? tsconfig ?? ".");
        const packageJsonPath = resolveJson("tailwindcss/package.json", projectDirectory);

        if(!packageJsonPath){
          warnOnce(`Tailwind CSS is not installed. Disabling rule ${ctx.id}.`);
          return {};
        }

        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        const version = parseSemanticVersion(packageJson.version);
        const installation = dirname(packageJsonPath);

        const context = {
          cwd: ctx.cwd,
          docs,
          installation,
          options,
          report: ({ data, fix, range, warnings, ...rest }) => {
            const loc = getLocByRange(ctx, range);

            if("id" in rest && rest.id){
              return void ctx.report({
                data,
                loc,
                ...fix !== undefined && {
                  fix: fixer => fixer.replaceTextRange(range, fix)
                },
                messageId: rest.id
              });
            }

            if("message" in rest && rest.message){
              return void ctx.report({
                data,
                loc,
                ...fix !== undefined && {
                  fix: fixer => fixer.replaceTextRange(range, fix)
                },
                message: augmentMessageWithWarnings(rest.message, docs, warnings)
              });
            }
          },
          version
        } satisfies RuleContext<Messages, Options>;

        initialize?.(context);

        return createRuleListener(eslintContext, context, lintLiterals);
      },
      meta: {
        docs: {
          description,
          recommended,
          url: docs
        },
        fixable: autofix ? "code" : undefined,
        schema: [
          {
            additionalProperties: false,
            properties: jsonSchema,
            type: "object"
          }
        ],
        type: category === "correctness" ? "problem" : "layout",
        ...messages && { messages }
      }
    }
  };
}

export function createRuleListener<Ctx extends Context>(ctx: Rule.RuleContext, context: Ctx, lintLiterals: (ctx: Ctx, literals: Literal[]) => void): Rule.RuleListener {

  const { attributes, callees, tags, variables } = context.options;

  const callExpression = {
    CallExpression(node: Node) {
      const callExpressionNode = node as CallExpression;

      const literals = getLiteralsByESCallExpression(ctx, callExpressionNode, callees);
      lintLiterals(context, literals);
    }
  };

  const variableDeclarators = {
    VariableDeclarator(node: Node) {
      const variableDeclaratorNode = node as VariableDeclarator;

      const literals = getLiteralsByESVariableDeclarator(ctx, variableDeclaratorNode, variables);
      lintLiterals(context, literals);
    }
  };

  const taggedTemplateExpression = {
    TaggedTemplateExpression(node: Node) {
      const taggedTemplateExpressionNode = node as TaggedTemplateExpression;

      const literals = getLiteralsByTaggedTemplateExpression(ctx, taggedTemplateExpressionNode, tags);
      lintLiterals(context, literals);
    }
  };

  const jsx = {
    JSXOpeningElement(node: Node) {
      const jsxNode = node as JSXOpeningElement;
      const jsxAttributes = getAttributesByJSXElement(ctx, jsxNode);

      for(const jsxAttribute of jsxAttributes){

        const attributeValue = jsxAttribute.value;

        if(!attributeValue){ continue; }

        const literals = getLiteralsByJSXAttribute(ctx, jsxAttribute, attributes);
        lintLiterals(context, literals);
      }
    }
  };

  const svelte = {
    SvelteStartTag(node: Node) {
      const svelteNode = node as unknown as SvelteStartTag;
      const svelteAttributes = getAttributesBySvelteTag(ctx, svelteNode);

      for(const svelteAttribute of svelteAttributes){
        const attributeName = svelteAttribute.key.name;

        if(typeof attributeName !== "string"){ continue; }

        const literals = getLiteralsBySvelteAttribute(ctx, svelteAttribute, attributes);
        lintLiterals(context, literals);
      }
    }
  };

  const vue = {
    VStartTag(node: Node) {
      const vueNode = node as unknown as AST.VStartTag;
      const vueAttributes = getAttributesByVueStartTag(ctx, vueNode);

      for(const attribute of vueAttributes){
        const literals = getLiteralsByVueAttribute(ctx, attribute, attributes);
        lintLiterals(context, literals);
      }
    }
  };

  const html = {
    Tag(node: Node) {
      const htmlTagNode = node as unknown as TagNode;
      const htmlAttributes = getAttributesByHTMLTag(ctx, htmlTagNode);

      for(const htmlAttribute of htmlAttributes){
        const literals = getLiteralsByHTMLAttribute(ctx, htmlAttribute, attributes);
        lintLiterals(context, literals);
      }
    }
  };

  const angular = {
    Element(node: Node) {
      const angularElementNode = node as unknown as TmplAstElement;
      const angularAttributes = getAttributesByAngularElement(ctx, angularElementNode);

      for(const angularAttribute of angularAttributes){
        const literals = getLiteralsByAngularAttribute(ctx, angularAttribute, attributes);
        lintLiterals(context, literals);
      }
    }
  };

  // Vue
  if(typeof ctx.sourceCode.parserServices?.defineTemplateBodyVisitor === "function"){
    return {
      // script tag
      ...callExpression,
      ...variableDeclarators,
      ...taggedTemplateExpression,

      // bound classes
      ...ctx.sourceCode.parserServices.defineTemplateBodyVisitor({
        ...callExpression,
        ...vue
      })
    };
  }

  return {
    ...callExpression,
    ...variableDeclarators,
    ...taggedTemplateExpression,
    ...jsx,
    ...svelte,
    ...vue,
    ...html,
    ...angular
  };
}
