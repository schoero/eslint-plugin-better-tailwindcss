import type { Rule } from "eslint";
import type { SourceLocation } from "estree";


export function getLocByRange(ctx: Rule.RuleContext, range: [number, number]): SourceLocation {
  const [rangeStart, rangeEnd] = range;

  const loc: SourceLocation = {
    end: ctx.sourceCode.getLocFromIndex(rangeEnd),
    start: ctx.sourceCode.getLocFromIndex(rangeStart)
  };

  return loc;
}
