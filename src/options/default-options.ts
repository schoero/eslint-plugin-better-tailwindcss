import { CC } from "better-tailwindcss:options/callees/cc.js";
import { CLB } from "better-tailwindcss:options/callees/clb.js";
import { CLSX } from "better-tailwindcss:options/callees/clsx.js";
import { CN } from "better-tailwindcss:options/callees/cn.js";
import { CNB } from "better-tailwindcss:options/callees/cnb.js";
import { CTL } from "better-tailwindcss:options/callees/ctl.js";
import { CVA } from "better-tailwindcss:options/callees/cva.js";
import { CX } from "better-tailwindcss:options/callees/cx.js";
import { DCNB } from "better-tailwindcss:options/callees/dcnb.js";
import { OBJSTR } from "better-tailwindcss:options/callees/objstr.js";
import { TV } from "better-tailwindcss:options/callees/tv.js";
import { TW_JOIN } from "better-tailwindcss:options/callees/twJoin.js";
import { TW_MERGE } from "better-tailwindcss:options/callees/twMerge.js";
import { TWC } from "better-tailwindcss:options/tags/twc.js";
import { TWX } from "better-tailwindcss:options/tags/twx.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { Tags } from "better-tailwindcss:options/schemas/tags.js";
import type { Variables } from "better-tailwindcss:options/schemas/variables.js";
import type { Selectors } from "better-tailwindcss:types/rule.js";


export const DEFAULT_CALLEE_SELECTORS = [
  ...CC,
  ...CLB,
  ...CLSX,
  ...CN,
  ...CNB,
  ...CTL,
  ...CVA,
  ...CX,
  ...DCNB,
  ...OBJSTR,
  ...TV,
  ...TW_JOIN,
  ...TW_MERGE
] satisfies Selectors;

export const DEFAULT_ATTRIBUTE_SELECTORS = [
  {
    kind: SelectorKind.Attribute,
    name: "^class(?:Name)?$"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "^class(?:Name)?$"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "^class:.*"
  },
  {
    kind: SelectorKind.Attribute,
    name: "(?:^\\[class\\]$)|(?:^\\[ngClass\\]$)"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "(?:^\\[class\\..*\\]$)"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      },
      {
        type: MatcherType.ObjectKey
      }
    ],
    name: "(?:^\\[class\\]$)|(?:^\\[ngClass\\]$)"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      },
      {
        type: MatcherType.ObjectKey
      }
    ],
    name: "^v-bind:class$"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.String
      },
      {
        type: MatcherType.ObjectKey
      }
    ],
    name: "^class:list$"
  },
  {
    kind: SelectorKind.Attribute,
    match: [
      {
        type: MatcherType.ObjectKey
      }
    ],
    name: "^classList$"
  }
] satisfies Selectors;

export const DEFAULT_VARIABLE_NAMES = [
  [
    "^classNames?$", [
      {
        match: MatcherType.String
      }
    ]
  ],
  [
    "^classes$", [
      {
        match: MatcherType.String
      }
    ]
  ],
  [
    "^styles?$", [
      {
        match: MatcherType.String
      }
    ]
  ]
] satisfies Variables;

export const DEFAULT_VARIABLE_SELECTORS = [
  {
    kind: SelectorKind.Variable,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "^classNames?$"
  },
  {
    kind: SelectorKind.Variable,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "^classes$"
  },
  {
    kind: SelectorKind.Variable,
    match: [
      {
        type: MatcherType.String
      }
    ],
    name: "^styles?$"
  }
] satisfies Selectors;

export const DEFAULT_TAG_NAMES = [] satisfies Tags;

export const DEFAULT_TAG_SELECTORS = [
  ...TWC,
  ...TWX
] satisfies Selectors;

export const DEFAULT_SELECTORS = [
  ...DEFAULT_ATTRIBUTE_SELECTORS,
  ...DEFAULT_CALLEE_SELECTORS,
  ...DEFAULT_VARIABLE_SELECTORS,
  ...DEFAULT_TAG_SELECTORS
] satisfies Selectors;
