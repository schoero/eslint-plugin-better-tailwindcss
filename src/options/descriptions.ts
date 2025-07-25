import { MatcherType } from "better-tailwindcss:types/rule.js";

import type { Rule } from "eslint";


const STRING_MATCHER_SCHEMA = {
  additionalProperties: false,
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
  additionalProperties: false,
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
  additionalProperties: false,
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

const ATTRIBUTE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals which should get linted.",
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

const ATTRIBUTE_MATCHER_CONFIG = {
  description: "List of matchers that will automatically be matched.",
  items: [
    {
      description: "Attribute name for which children get linted if matched.",
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

const ATTRIBUTE_NAME_CONFIG = {
  description: "Attribute name that for which children get linted.",
  type: "string"
};

const CALLEE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals which should get linted.",
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
      description: "Callee name for which children get linted if matched.",
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

const CALLEE_NAME_CONFIG = {
  description: "Callee name for which children get linted.",
  type: "string"
};

const VARIABLE_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals which should get linted.",
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
      description: "Variable name for which children get linted if matched.",
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

const VARIABLE_NAME_CONFIG = {
  description: "Variable name for which children get linted.",
  type: "string"
};

const TAG_REGEX_CONFIG = {
  description: "List of regular expressions that matches string literals which should get linted.",
  items: [
    {
      description: "Regular expression that filters the template literal tags and matches the content for further processing in a group.",
      type: "string"
    },
    {
      description: "Regular expression that matches each string literal in a group.",
      type: "string"
    }
  ],
  type: "array"
};

const TAG_MATCHER_CONFIG = {
  description: "List of matchers that will automatically be matched.",
  items: [
    {
      description: "Template literal tag for which children get linted if matched.",
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

const TAG_NAME_CONFIG = {
  description: "Template literal tag that should get linted.",
  type: "string"
};


export const CALLEE_SCHEMA = {
  callees: {
    description: "List of function names which arguments should get linted.",
    items: {
      anyOf: [
        CALLEE_REGEX_CONFIG,
        CALLEE_MATCHER_CONFIG,
        CALLEE_NAME_CONFIG
      ]
    },
    type: "array"
  }
} satisfies Rule.RuleMetaData["schema"];

export const ATTRIBUTE_SCHEMA = {
  attributes: {
    description: "List of attribute names that should get linted.",
    items: {
      anyOf: [
        ATTRIBUTE_NAME_CONFIG,
        ATTRIBUTE_REGEX_CONFIG,
        ATTRIBUTE_MATCHER_CONFIG
      ]
    },
    type: "array"
  }
} satisfies Rule.RuleMetaData["schema"];

export const VARIABLE_SCHEMA = {
  variables: {
    description: "List of variable names which values should get linted.",
    items: {
      anyOf: [
        VARIABLE_REGEX_CONFIG,
        VARIABLE_MATCHER_CONFIG,
        VARIABLE_NAME_CONFIG
      ]
    },
    type: "array"
  }
} satisfies Rule.RuleMetaData["schema"];

export const TAG_SCHEMA = {
  tags: {
    description: "List of template literal tags that should get linted.",
    items: {
      anyOf: [
        TAG_REGEX_CONFIG,
        TAG_MATCHER_CONFIG,
        TAG_NAME_CONFIG
      ]
    },
    type: "array"
  }
} satisfies Rule.RuleMetaData["schema"];

export const ENTRYPOINT_SCHEMA = {
  entryPoint: {
    description: "The path to the css entry point of the project. If not specified, the plugin will fall back to the default tailwind classes.",
    type: "string"
  }
};

export const TAILWIND_CONFIG_SCHEMA = {
  tailwindConfig: {
    description: "The path to the tailwind config file. If not specified, the plugin will try to find it automatically or falls back to the default configuration.",
    type: "string"
  }
};

export const TSCONFIG_SCHEMA = {
  tsconfig: {
    description: "The path to the tsconfig file. Is used to resolve path aliases in the tsconfig.",
    type: "string"
  }
};
