import { multiline } from "better-tailwindcss:rules/deprecated/multiline.js";
import { sortClasses } from "better-tailwindcss:rules/deprecated/sort-classes.js";
import { enforceConsistentClassOrder } from "better-tailwindcss:rules/enforce-consistent-class-order.js";
import { enforceConsistentLineWrapping } from "better-tailwindcss:rules/enforce-consistent-line-wrapping.js";
import { enforceConsistentVariableSyntax } from "better-tailwindcss:rules/enforce-consistent-variable-syntax.js";
import { noConflictingClasses } from "better-tailwindcss:rules/no-conflicting-classes.js";
import { noDuplicateClasses } from "better-tailwindcss:rules/no-duplicate-classes.js";
import { noRestrictedClasses } from "better-tailwindcss:rules/no-restricted-classes.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { noUnregisteredClasses } from "better-tailwindcss:rules/no-unregistered-classes.js";

import type { ESLint } from "eslint";


const plugin = {
  meta: {
    name: "better-tailwindcss"
  },
  rules: {
    [multiline.name]: multiline.rule,
    [sortClasses.name]: sortClasses.rule,

    [enforceConsistentClassOrder.name]: enforceConsistentClassOrder.rule,
    [enforceConsistentLineWrapping.name]: enforceConsistentLineWrapping.rule,
    [enforceConsistentVariableSyntax.name]: enforceConsistentVariableSyntax.rule,
    [noConflictingClasses.name]: noConflictingClasses.rule,
    [noDuplicateClasses.name]: noDuplicateClasses.rule,
    [noRestrictedClasses.name]: noRestrictedClasses.rule,
    [noUnnecessaryWhitespace.name]: noUnnecessaryWhitespace.rule,
    [noUnregisteredClasses.name]: noUnregisteredClasses.rule
  }
} satisfies ESLint.Plugin;

const plugins = [plugin.meta.name];


const getStylisticRules = (severity: "error" | "warn" = "warn") => {
  return {
    [`${plugin.meta.name}/${enforceConsistentClassOrder.name}`]: severity,
    [`${plugin.meta.name}/${enforceConsistentLineWrapping.name}`]: severity,
    [`${plugin.meta.name}/${noDuplicateClasses.name}`]: severity,
    [`${plugin.meta.name}/${noUnnecessaryWhitespace.name}`]: severity
  };
};

const getCorrectnessRules = (severity: "error" | "warn" = "error") => {
  return {
    [`${plugin.meta.name}/${noConflictingClasses.name}`]: severity,
    [`${plugin.meta.name}/${noUnregisteredClasses.name}`]: severity
  };
};


const createConfig = (
  name: string,
  getRulesFunction: (severity?: "error" | "warn") => {
    [x: string]: "error" | "warn";
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
