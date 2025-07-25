import type { ClassOrder } from "./class-order.js";


export function getClassOrder(context: any, classes: string[]): ClassOrder {
  return context.getClassOrder(classes);
}
