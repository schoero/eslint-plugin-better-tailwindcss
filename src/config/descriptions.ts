import { MatcherType } from "readable-tailwind:types:rule.js";

import type { Rule } from "eslint";


export function getClassAttributeSchema(defaultValue: unknown) {
  return {
    classAttributes: {
      default: defaultValue,
      description: "List of attribute names that should also get linted.",
      items: {
        anyOf: [
          CLASS_ATTRIBUTE_NAME_CONFIG,
          CLASS_ATTRIBUTE_REGEX_CONFIG,
          CLASS_ATTRIBUTE_MATCHER_CONFIG
        ]
      },
      type: "array"
    }
  } satisfies Rule.RuleMetaData["schema"];
}

export function getCalleeSchema(defaultValue: unknown) {
  return {
    callees: {
      default: defaultValue,
      description: "List of function names which arguments should also get linted.",
      items: {
        anyOf: [
          CALLEE_REGEX_CONFIG,
          CALLEE_MATCHER_CONFIG,
          CALLEE_ATTRIBUTE_NAME_CONFIG
        ]
      },
      type: "array"
    }
  } satisfies Rule.RuleMetaData["schema"];
}

export function getVariableSchema(defaultValue: unknown) {
  return {
    variables: {
      default: defaultValue,
      description: "List of variable names which values should also get linted.",
      items: {
        anyOf: [
          VARIABLE_REGEX_CONFIG,
          VARIABLE_MATCHER_CONFIG,
          VARIABLE_ATTRIBUTE_NAME_CONFIG
        ]
      },
      type: "array"
    }
  } satisfies Rule.RuleMetaData["schema"];
}

const STRING_MATCHER_SCHEMA = {
  properties: {
    match: {
      description: "Matcher type that will be applied.",
      enum: [MatcherType.String],
      type: "string"
    }
  },
  type: "object"
} satisfies Rule.RuleMetaData["schema"];

const OBJECT_KEY_MATCHER_SCHEMA = {
  properties: {
    match: {
      description: "Matcher type that will be applied.",
      enum: [MatcherType.ObjectKey],
      type: "string"
    },
    pathPattern: {
      description: "Regular expression that filters the object key and matches the content for further processing in a group.",
      type: "string"
    }
  },
  type: "object"
} satisfies Rule.RuleMetaData["schema"];

const OBJECT_VALUE_MATCHER_SCHEMA = {
  properties: {
    match: {
      description: "Matcher type that will be applied.",
      enum: [MatcherType.ObjectValue],
      type: "string"
    },
    pathPattern: {
      description: "Regular expression that filters the object value and matches the content for further processing in a group.",
      type: "string"
    }
  },
  type: "object"
} satisfies Rule.RuleMetaData["schema"];

const CLASS_ATTRIBUTE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals that should also get linted.",
  items: [
    {
      description: "Regular expression that filters the attribute and matches the content for further processing in a group.",
      type: "string"
    },
    {
      description: "Regular expression that matches each string literal in a group.",
      type: "string"
    }
  ],
  type: "array"
};

const CLASS_ATTRIBUTE_MATCHER_CONFIG = {
  description: "List of matchers that will automatically be matched.",
  items: [
    {
      description: "Attribute name which children get linted if matched.",
      type: "string"
    },
    {
      description: "List of matchers that will be applied.",
      items: {
        anyOf: [
          STRING_MATCHER_SCHEMA,
          OBJECT_KEY_MATCHER_SCHEMA,
          OBJECT_VALUE_MATCHER_SCHEMA
        ],
        type: "object"
      },
      type: "array"
    }
  ],
  type: "array"
};

const CLASS_ATTRIBUTE_NAME_CONFIG = {
  description: "Attribute name that which children get linted.",
  type: "string"
};

const CALLEE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals that should also get linted.",
  items: [
    {
      description: "Regular expression that filters the callee and matches the content for further processing in a group.",
      type: "string"
    },
    {
      description: "Regular expression that matches each string literal in a group.",
      type: "string"
    }
  ],
  type: "array"
};

const CALLEE_MATCHER_CONFIG = {
  description: "List of matchers that will automatically be matched.",
  items: [
    {
      description: "Callee name which children get linted if matched.",
      type: "string"
    },
    {
      description: "List of matchers that will be applied.",
      items: {
        anyOf: [
          STRING_MATCHER_SCHEMA,
          OBJECT_KEY_MATCHER_SCHEMA,
          OBJECT_VALUE_MATCHER_SCHEMA
        ],
        type: "object"
      },
      type: "array"
    }
  ],
  type: "array"
};

const CALLEE_ATTRIBUTE_NAME_CONFIG = {
  description: "Callee name which children get linted.",
  type: "string"
};

const VARIABLE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals that should also get linted.",
  items: [
    {
      description: "Regular expression that filters the variable and matches the content for further processing in a group.",
      type: "string"
    },
    {
      description: "Regular expression that matches each string literal in a group.",
      type: "string"
    }
  ],
  type: "array"
};

const VARIABLE_MATCHER_CONFIG = {
  description: "List of matchers that will automatically be matched.",
  items: [
    {
      description: "Variable name which children get linted if matched.",
      type: "string"
    },
    {
      description: "List of matchers that will be applied.",
      items: {
        anyOf: [
          STRING_MATCHER_SCHEMA,
          OBJECT_KEY_MATCHER_SCHEMA,
          OBJECT_VALUE_MATCHER_SCHEMA
        ],
        type: "object"
      },
      type: "array"
    }
  ],
  type: "array"
};

const VARIABLE_ATTRIBUTE_NAME_CONFIG = {
  description: "Variable name which children get linted.",
  type: "string"
};
