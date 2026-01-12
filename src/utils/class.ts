import type { Context } from "better-tailwindcss:types/rule.js";


interface ClassParts {
  base: string;
  important: [boolean, boolean];
  negative: boolean;
  prefix: string;
  separator: string;
  variants: string[] | undefined;
}

export function buildClass(ctx: Context, { base, important, negative, prefix, separator, variants }: ClassParts): string {

  const importantAtStart = important[0] && "!";
  const importantAtEnd = important[1] && "!";
  const negativePrefix = negative && "-";

  if(ctx.version.major >= 4){
    return [
      prefix,
      ...variants ?? [],
      [importantAtStart, negativePrefix, base, importantAtEnd].filter(Boolean).join("")
    ].filter(Boolean).join(separator);
  } else {
    return [
      ...variants ?? [],
      [importantAtStart, prefix, negativePrefix, base, importantAtEnd].filter(Boolean).join("")
    ].filter(Boolean).join(separator);
  }
}
