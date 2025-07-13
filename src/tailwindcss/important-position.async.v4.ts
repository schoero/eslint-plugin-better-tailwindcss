import { getClassVariants } from "./class-variants.async.v4.js";
import { getPrefix } from "./prefix.async.v4.js";

import type { GetImportantPositionResponse, Position } from "./important-position.js";


export function getImportantPosition(context: any, classes: string[], position: Position): GetImportantPositionResponse {
  const variants = getClassVariants(context, classes);
  const prefix = getPrefix(context);
  const separator = ":";

  return classes.reduce<GetImportantPositionResponse>((acc, className) => {
    const classVariants = variants.find(([name]) => name === className)?.[1] ?? [];

    let base = className
      .replace(classVariants.join(separator), "")
      .replace(prefix + separator, "")
      .replace(/^:/, "");

    const isImportantAtStart = base.startsWith("!");
    base = base.replace(/^!/, "");

    const isImportantAtEnd = base.endsWith("!");
    base = base.replace(/!$/, "");

    if(
      !isImportantAtStart && !isImportantAtEnd ||
      position === "legacy" && isImportantAtStart ||
      position === "recommended" && isImportantAtEnd
    ){
      return acc;
    }

    if(isImportantAtStart && position === "recommended"){
      acc[className] = [
        prefix,
        ...classVariants,
        [base, "!"].join("")
      ].filter(Boolean).join(separator);
    }

    if(isImportantAtEnd && position === "legacy"){
      acc[className] = [
        prefix,
        ...classVariants,
        ["!", base].join("")
      ].filter(Boolean).join(separator);
    }

    return acc;
  }, {});
}
