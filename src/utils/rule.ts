import { toJsonSchema } from "@valibot/to-json-schema";
import { object } from "valibot";

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
import { getOptions } from "better-tailwindcss:utils/options.js";
import { isTailwindcssInstalled } from "better-tailwindcss:utils/tailwindcss.js";
import { warnOnce } from "better-tailwindcss:utils/warn.js";

import type { TmplAstElement } from "@angular-eslint/bundled-angular-compiler";
import type { TagNode } from "es-html-parser";
import type { Rule } from "eslint";
import type { CallExpression, Node, TaggedTemplateExpression, VariableDeclarator } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import type { SvelteStartTag } from "svelte-eslint-parser/lib/ast/index.js";
import type { AST } from "vue-eslint-parser";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context, CreateRule } from "better-tailwindcss:types/rule.js";


export const createRule: CreateRule = ({
  autofix,
  category,
  description,
  docs,
  initialize,
  lintLiterals,
  messages,
  name,
  recommended,
  schema
}) => {

  const propertiesSchema = object({
    ...COMMON_OPTIONS.entries,
    ...schema?.entries ?? {}
  });

  const jsonSchema = toJsonSchema(propertiesSchema).properties;

  return {
    name,
    rule: {
      create: ctx => {
        if(!isTailwindcssInstalled()){
          warnOnce(`Tailwind CSS is not installed. Disabling rule ${ctx.id}.`);
          return {};
        }

        initialize?.(ctx);

        return createRuleListener(ctx, lintLiterals);
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
    },
    schema
  };
};

export function createRuleListener<Ctx extends Context>(ctx: Ctx, lintLiterals: (ctx: Ctx, literals: Literal[]) => void): Rule.RuleListener {

  const { attributes, callees, tags, variables } = getOptions(ctx);

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

  const taggedTemplateExpression = {
    TaggedTemplateExpression(node: Node) {
      const taggedTemplateExpressionNode = node as TaggedTemplateExpression;

      const literals = getLiteralsByTaggedTemplateExpression(ctx, taggedTemplateExpressionNode, tags);
      lintLiterals(ctx, literals);
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
        lintLiterals(ctx, literals);
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
        lintLiterals(ctx, literals);
      }
    }
  };

  const vue = {
    VStartTag(node: Node) {
      const vueNode = node as unknown as AST.VStartTag;
      const vueAttributes = getAttributesByVueStartTag(ctx, vueNode);

      for(const attribute of vueAttributes){
        const literals = getLiteralsByVueAttribute(ctx, attribute, attributes);
        lintLiterals(ctx, literals);
      }
    }
  };

  const html = {
    Tag(node: Node) {
      const htmlTagNode = node as unknown as TagNode;
      const htmlAttributes = getAttributesByHTMLTag(ctx, htmlTagNode);

      for(const htmlAttribute of htmlAttributes){
        const literals = getLiteralsByHTMLAttribute(ctx, htmlAttribute, attributes);
        lintLiterals(ctx, literals);
      }
    }
  };

  const angular = {
    Element(node: Node) {
      const angularElementNode = node as unknown as TmplAstElement;
      const angularAttributes = getAttributesByAngularElement(ctx, angularElementNode);

      for(const angularAttribute of angularAttributes){
        const literals = getLiteralsByAngularAttribute(ctx, angularAttribute, attributes);
        lintLiterals(ctx, literals);
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
