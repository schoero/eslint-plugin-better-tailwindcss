import { VARIANT_ORDER_FLAGS } from "../async-utils/order.js";

import type { VariantOrder } from "./variant-order.js";


export function getVariantOrder(tailwindContext: any, classes: string[]): VariantOrder {
  const candidates = classes.map(className => tailwindContext.parseCandidate(className));

  const variantOrder = tailwindContext.getVariantOrder();
  const variants = tailwindContext.getVariants();

  const variantsByName = new Map(
    (variants ?? []).map(variant => {
      return [variant.name, variant];
    })
  );
  const variantOrderByName = new Map(
    [...variantOrder.entries()].map(([variant, order]) => {
      return [tailwindContext.printVariant(variant), order];
    })
  );

  return candidates.reduce<VariantOrder>((acc, parsedCandidates) => {
    for(const candidate of parsedCandidates ?? []){
      for(const variantCandidate of candidate?.variants ?? []){
        const variantName = tailwindContext.printVariant(variantCandidate);
        const variant = variantsByName.get(variantName);
        const twOrder = variantOrderByName.get(variantName) || 0;
        const globalOrder = hasGlobalSelector(variant) ? VARIANT_ORDER_FLAGS.GLOBAL : 0;

        acc[variantName] ??= globalOrder | twOrder;
      }
    }

    return acc;
  }, {});
}


function hasGlobalSelector(variant: any): boolean {
  const selectors = variant?.selectors?.();

  if(!Array.isArray(selectors) || selectors.length <= 0){
    return false;
  }

  return selectors.every(selector => {
    return typeof selector === "string" && !selector.includes("&");
  });
}
