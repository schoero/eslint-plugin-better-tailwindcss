/* eslint-disable eslint-plugin-jsdoc/require-returns */
/* eslint-disable eslint-plugin-jsdoc/require-description */
import { DEFAULT_SELECTORS } from "better-tailwindcss:options/default-options.js";
import { migrateFlatSelectorsToLegacySelectors } from "better-tailwindcss:options/migrate.js";
import { SelectorKind } from "better-tailwindcss:types/rule.js";
import { isSelectorKind } from "better-tailwindcss:utils/selectors.js";

import type { Attributes } from "better-tailwindcss:options/schemas/attributes.js";
import type { Callees } from "better-tailwindcss:options/schemas/callees.js";
import type { Tags } from "better-tailwindcss:options/schemas/tags.js";
import type { Variables } from "better-tailwindcss:options/schemas/variables.js";

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultCallees() {
  return migrateFlatSelectorsToLegacySelectors(
    DEFAULT_SELECTORS.filter(isSelectorKind(SelectorKind.Callee))
  ).callees ?? [] satisfies Callees;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultAttributes() {
  return migrateFlatSelectorsToLegacySelectors(
    DEFAULT_SELECTORS.filter(isSelectorKind(SelectorKind.Attribute))
  ).attributes ?? [] satisfies Attributes;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultVariables() {
  return migrateFlatSelectorsToLegacySelectors(
    DEFAULT_SELECTORS.filter(isSelectorKind(SelectorKind.Variable))
  ).variables ?? [] satisfies Variables;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultTags() {
  return migrateFlatSelectorsToLegacySelectors(
    DEFAULT_SELECTORS.filter(isSelectorKind(SelectorKind.Tag))
  ).tags ?? [] satisfies Tags;
}

export function getDefaultSelectors() {
  return DEFAULT_SELECTORS;
}
