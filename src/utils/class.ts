import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";


interface ClassParts {
  base: string;
  important: [boolean, boolean];
  negative: boolean;
  prefix: string;
  separator: string;
  variants: string[];
}

export function buildClass({ base, important, negative, prefix, separator, variants }: ClassParts): string {
  const { major } = getTailwindcssVersion();

  const importantAtStart = important[0] && "!";
  const importantAtEnd = important[1] && "!";
  const negativePrefix = negative && "-";

  if(major >= TailwindcssVersion.V4){
    return [
      prefix,
      ...variants,
      [importantAtStart, negativePrefix, base, importantAtEnd].filter(Boolean).join("")
    ].filter(Boolean).join(separator);
  } else {
    return [
      ...variants,
      [importantAtStart, prefix, negativePrefix, base, importantAtEnd].filter(Boolean).join("")
    ].filter(Boolean).join(separator);
  }
}
