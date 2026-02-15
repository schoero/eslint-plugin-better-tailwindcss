import type { Selector, SelectorByKind, SelectorKind } from "better-tailwindcss:types/rule.js";


export function isSelectorKind<Kind extends SelectorKind>(kind: Kind) {
  return (selector: Selector): selector is SelectorByKind<Kind> => selector.kind === kind;
}
