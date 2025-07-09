import type { GetClassOrderResponse } from "./class-order.js";


export function getClassOrder(context: any, classes: string[]): GetClassOrderResponse {
  return context.getClassOrder(classes);
}
