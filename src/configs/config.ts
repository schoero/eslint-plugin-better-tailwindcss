import { enforceCanonicalClasses } from "better-tailwindcss:rules/enforce-canonical-classes.js";
import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { enforceConsistentImportantPosition } from "better-tailwindcss:rules/enforce-consistent-important-position.js";
import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";
import { enforceConsistentVariableSyntax } from "better-tailwindcss:rules/enforce-consistent-variable-syntax.js";
import { enforceShorthandClasses } from "better-tailwindcss:rules/enforce-shorthand-classes.js";
import { noConflictingClasses } from "better-tailwindcss:rules/no-conflicting-classes.js";
import { noDeprecatedClasses } from "better-tailwindcss:rules/no-deprecated-classes.js";
import { noDuplicateClasses } from "better-tailwindcss:rules/no-duplicate-classes.js";
import { noRestrictedClasses } from "better-tailwindcss:rules/no-restricted-classes.js";
import { noUnknownClasses } from "better-tailwindcss:rules/no-unknown-classes.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";

import type { ESLint, JSRuleDefinition } from "eslint";


type Severity = "error" | "warn";

const rules = [
  enforceConsistentClassOrder,
  enforceConsistentImportantPosition,
  enforceConsistentLineWrapping,
  enforceConsistentVariableSyntax,
  enforceShorthandClasses,
  noConflictingClasses,
  noDeprecatedClasses,
  noDuplicateClasses,
  noRestrictedClasses,
  noUnnecessaryWhitespace,
  noUnknownClasses,
  enforceCanonicalClasses
];

const plugin = {
  meta: {
    name: "better-tailwindcss"
  },
  rules: rules.reduce<Record<string, JSRuleDefinition>>((acc, { name, rule }) => {
    acc[name] = rule;
    return acc;
  }, {})
} satisfies ESLint.Plugin;

const plugins = [plugin.meta.name];


const getStylisticRules = (severity: Severity = "warn") => {
  return rules.reduce<Record<string, Severity>>((acc, { name, rule }) => {
    if(rule.meta?.type !== "layout"){
      return acc;
    }

    acc[`${plugin.meta.name}/${name}`] = severity;
    return acc;
  }, {});
};

const getCorrectnessRules = (severity: Severity = "error") => {
  return rules.reduce<Record<string, Severity>>((acc, { name, rule }) => {
    if(rule.meta?.type !== "problem"){
      return acc;
    }

    acc[`${plugin.meta.name}/${name}`] = severity;
    return acc;
  }, {});
};

const createConfig = (
  name: string,
  getRulesFunction: (severity?: Severity) => {
    [x: string]: Severity;
  }
) => {
  return {
    [`${name}-error`]: {
      plugins,
      rules: getRulesFunction("error")
    },
    [`${name}-warn`]: {
      plugins,
      rules: getRulesFunction("warn")
    },
    [name]: {
      plugins,
      rules: getRulesFunction()
    }
  };
};

export const config = {
  ...plugin,

  configs: {
    ...createConfig("stylistic", getStylisticRules),
    ...createConfig("correctness", getCorrectnessRules),
    ...createConfig("recommended", severity => ({
      ...getStylisticRules(severity),
      ...getCorrectnessRules(severity)
    }))
  }
} satisfies ESLint.Plugin;
