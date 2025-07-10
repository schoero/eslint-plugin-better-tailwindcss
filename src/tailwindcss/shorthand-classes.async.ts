import { replacePlaceholders } from "../async-utils/string.js";

import type { GetShorthandClassesResponse, Shorthands } from "./shorthand-classes.js";


export const shorthands = [
  [
    [["^w-(.*)", "^h-(.*)"], ["size-$1"]]
  ],
  [
    [["^ml-(.*)", "^mr-(.*)", "^mt-(.*)", "^mb-(.*)"], ["m-$1"]],
    [["^mx-(.*)", "^my-(.*)"], ["m-$1"]],
    [["^ms-(.*)", "^me-(.*)"], ["mx-$1"]],
    [["^ml-(.*)", "^mr-(.*)"], ["mx-$1"]],
    [["^mt-(.*)", "^mb-(.*)"], ["my-$1"]]
  ],
  [
    [["^pl-(.*)", "^pr-(.*)", "^pt-(.*)", "^pb-(.*)"], ["p-$1"]],
    [["^px-(.*)", "^py-(.*)"], ["p-$1"]],
    [["^ps-(.*)", "^pe-(.*)"], ["px-$1"]],
    [["^pl-(.*)", "^pr-(.*)"], ["px-$1"]],
    [["^pt-(.*)", "^pb-(.*)"], ["py-$1"]]
  ],
  [
    [["^border-t-(.*)", "^border-b-(.*)", "^border-l-(.*)", "^border-r-(.*)"], ["border-$1"]],
    [["^border-x-(.*)", "^border-y-(.*)"], ["border-$1"]],
    [["^border-s-(.*)", "^border-e-(.*)"], ["border-x-$1"]],
    [["^border-l-(.*)", "^border-r-(.*)"], ["border-x-$1"]],
    [["^border-t-(.*)", "^border-b-(.*)"], ["border-y-$1"]]
  ],
  [
    [["^border-spacing-x-(.*)", "^border-spacing-y-(.*)"], ["border-spacing-$1"]]
  ],
  [
    [["^rounded-tl-(.*)", "^rounded-tr-(.*)", "^rounded-bl-(.*)", "^rounded-br-(.*)"], ["rounded-$1"]],
    [["^rounded-tl-(.*)", "^rounded-tr-(.*)"], ["rounded-t-$1"]],
    [["^rounded-bl-(.*)", "^rounded-br-(.*)"], ["rounded-b-$1"]],
    [["^rounded-tl-(.*)", "^rounded-bl-(.*)"], ["rounded-l-$1"]],
    [["^rounded-tr-(.*)", "^rounded-br-(.*)"], ["rounded-r-$1"]]
  ],
  [
    [["^scroll-mt-(.*)", "^scroll-mb-(.*)", "^scroll-ml-(.*)", "^scroll-mr-(.*)"], ["scroll-m-$1"]],
    [["^scroll-mx-(.*)", "^scroll-my-(.*)"], ["scroll-m-$1"]],
    [["^scroll-ms-(.*)", "^scroll-me-(.*)"], ["scroll-mx-$1"]],
    [["^scroll-ml-(.*)", "^scroll-mr-(.*)"], ["scroll-mx-$1"]],
    [["^scroll-mt-(.*)", "^scroll-mb-(.*)"], ["scroll-my-$1"]]
  ],
  [
    [["^scroll-pt-(.*)", "^scroll-pb-(.*)", "^scroll-pl-(.*)", "^scroll-pr-(.*)"], ["scroll-p-$1"]],
    [["^scroll-px-(.*)", "^scroll-py-(.*)"], ["scroll-p-$1"]],
    [["^scroll-pl-(.*)", "^scroll-pr-(.*)"], ["scroll-px-$1"]],
    [["^scroll-ps-(.*)", "^scroll-pe-(.*)"], ["scroll-px-$1"]],
    [["^scroll-pt-(.*)", "^scroll-pb-(.*)"], ["scroll-py-$1"]]
  ],
  [
    [["^top-(.*)", "^right-(.*)", "^bottom-(.*)", "^left-(.*)"], ["inset-$1"]],
    [["^inset-x-(.*)", "^inset-y-(.*)"], ["inset-$1"]]
  ],
  [
    [["^divide-x-(.*)", "^divide-y-(.*)"], ["divide-$1"]]
  ],
  [
    [["^space-x-(.*)", "^space-y-(.*)"], ["space-$1"]]
  ],
  [
    [["^gap-x-(.*)", "^gap-y-(.*)"], ["gap-$1"]]
  ],
  [
    [["^translate-x-(.*)", "^translate-y-(.*)"], ["translate-$1"]]
  ],
  [
    [["^rotate-x-(.*)", "^rotate-y-(.*)"], ["rotate-$1"]]
  ],
  [
    [["^skew-x-(.*)", "^skew-y-(.*)"], ["skew-$1"]]
  ],
  [
    [["^scale-x-(.*)", "^scale-y-(.*)", "^scale-z-(.*)"], ["scale-$1", "scale-3d"]],
    [["^scale-x-(.*)", "^scale-y-(.*)"], ["scale-$1"]]
  ],
  [
    [["^content-(.*)", "^justify-content-(.*)"], ["place-content-$1"]],
    [["^items-(.*)", "^justify-items-(.*)"], ["place-items-$1"]],
    [["^self-(.*)", "^justify-self-(.*)"], ["place-self-$1"]]
  ],
  [
    [["^overflow-hidden", "^text-ellipsis", "^whitespace-nowrap"], ["truncate"]]
  ]
] satisfies Shorthands;

export function getShorthands(classes: string[]): GetShorthandClassesResponse[] {

  const possibleShorthandClassesGroups: GetShorthandClassesResponse[] = [];


  for(const shorthandGroup of shorthands){

    const sortedShorthandGroup = shorthandGroup.sort((a, b) => b[0].length - a[0].length);

    const possibleShorthandClasses: GetShorthandClassesResponse = [];

    shorthandLoop: for(const [classPatterns, substitutes] of sortedShorthandGroup){

      const longhands: string[] = [];
      const groups: string[] = [];

      for(const classPattern of classPatterns){
        classNameLoop: for(const className of classes){
          const match = className.match(new RegExp(classPattern));

          if(!match){
            continue classNameLoop;
          }

          for(let m = 0; m < match.length; m++){
            if(groups[m] === undefined){
              groups[m] = match[m];
              continue;
            }

            if(m === 0){
              continue;
            }

            if(groups[m] !== match[m]){
              continue shorthandLoop;
            }
          }

          longhands.push(className);
        }
      }

      if(longhands.length === classPatterns.length){
        possibleShorthandClasses.push([longhands, substitutes.map(substitute => replacePlaceholders(substitute, groups))]);
      }
    }

    if(possibleShorthandClasses.length > 0){
      possibleShorthandClassesGroups.push(possibleShorthandClasses.sort((a, b) => b[0].length - a[0].length));
    }

  }

  return possibleShorthandClassesGroups;
}
