import type { ClassOrder } from "./class-order.js";


export function getClassOrder(tailwindContext: any, classes: string[]): ClassOrder {
  return tailwindContext.getClassOrder(classes);
}
