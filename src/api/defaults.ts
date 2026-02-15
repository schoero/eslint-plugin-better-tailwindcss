/* eslint-disable eslint-plugin-jsdoc/require-returns */
/* eslint-disable eslint-plugin-jsdoc/require-description */
import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_SELECTORS,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultCallees() {
  return DEFAULT_CALLEE_NAMES;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultAttributes() {
  return DEFAULT_ATTRIBUTE_NAMES;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultVariables() {
  return DEFAULT_VARIABLE_NAMES;
}

/**
 * @deprecated Migrate to selectors instead.
 */
export function getDefaultTags() {
  return DEFAULT_TAG_NAMES;
}

export function getDefaultSelectors() {
  return DEFAULT_SELECTORS;
}
