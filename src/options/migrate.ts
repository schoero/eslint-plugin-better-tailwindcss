import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { SelectorMatcher, Selectors } from "better-tailwindcss:types/rule.js";


type LegacyMatcher = {
  match: MatcherType;
  pathPattern?: string;
};

type LegacySelector = string | [string, LegacyMatcher[]];

type LegacySelectorsByKind = {
  attributes?: LegacySelector[] | undefined;
  callees?: LegacySelector[] | undefined;
  tags?: LegacySelector[] | undefined;
  variables?: LegacySelector[] | undefined;
};


export function migrateLegacySelectorsToFlatSelectors(legacy: LegacySelectorsByKind): Selectors {
  const selectors: Selectors = [];

  const kinds = [
    SelectorKind.Attribute,
    SelectorKind.Callee,
    SelectorKind.Tag,
    SelectorKind.Variable
  ] as const;

  for(const kind of kinds){
    const legacySelectors = getLegacySelectorsOfKind(legacy, kind);

    for(const selector of legacySelectors){
      selectors.push(migrateLegacySelector(selector, kind));
    }
  }

  return selectors;
}

export function hasLegacySelectorConfig(options: LegacySelectorsByKind): boolean {
  return (
    options.attributes !== undefined ||
    options.callees !== undefined ||
    options.tags !== undefined ||
    options.variables !== undefined
  );
}


function toSelectorMatch(matcher: LegacyMatcher): SelectorMatcher {
  if(matcher.match === MatcherType.String){
    return {
      type: matcher.match
    };
  }

  return {
    ...matcher.pathPattern !== undefined && {
      pathPattern: matcher.pathPattern
    },
    type: matcher.match
  };
}

function getLegacySelectorsOfKind(legacy: LegacySelectorsByKind, kind: SelectorKind): LegacySelector[] {
  switch (kind){
    case SelectorKind.Attribute:
      return legacy.attributes ?? [];
    case SelectorKind.Callee:
      return legacy.callees ?? [];
    case SelectorKind.Tag:
      return legacy.tags ?? [];
    case SelectorKind.Variable:
      return legacy.variables ?? [];
  }
}

function migrateLegacySelector(selector: LegacySelector, kind: SelectorKind) {
  if(typeof selector === "string"){
    return {
      kind,
      name: selector
    };
  }

  return {
    kind,
    match: selector[1].map(toSelectorMatch),
    name: selector[0]
  };
}
