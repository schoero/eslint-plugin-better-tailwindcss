import { getDefaults } from "valibot";

import { COMMON_OPTIONS } from "better-tailwindcss:options/descriptions.js";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Context, ESLintRule } from "better-tailwindcss:types/rule.js";


export function getOptions<Ctx extends Context, Rule extends ESLintRule>(ctx: Ctx, rule?: Rule): Required<CommonOptions & Ctx["options"][0]> {
  const commonOptions = getDefaults(COMMON_OPTIONS);
  const defaultOptions = rule?.schema ? getDefaults(rule?.schema) : {};
  const settings = ctx.settings?.["eslint-plugin-better-tailwindcss"] ?? ctx.settings?.["better-tailwindcss"] ?? {};
  const options = ctx.options[0] ?? {};

  return {
    ...commonOptions,
    ...defaultOptions,
    ...settings,
    ...options
  } as Required<CommonOptions & Ctx["options"][0]>;
}
