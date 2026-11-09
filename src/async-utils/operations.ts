import type { CanonicalClasses, CanonicalClassOptions } from "../tailwindcss/canonical-classes.js";
import type { ClassOrder } from "../tailwindcss/class-order.js";
import type { ConflictingClasses } from "../tailwindcss/conflicting-classes.js";
import type { CustomComponentClasses } from "../tailwindcss/custom-component-classes.js";
import type { DissectedClasses } from "../tailwindcss/dissect-classes.js";
import type { Prefix, Suffix } from "../tailwindcss/prefix.js";
import type { UnknownClass } from "../tailwindcss/unknown-classes.js";
import type { VariantOrder } from "../tailwindcss/variant-order.js";
import type { AsyncContext } from "../utils/context.js";


export interface Operations {
  getCanonicalClasses: (ctx: AsyncContext, classes: string[], options: CanonicalClassOptions) => CanonicalClasses;
  getClassOrder: (ctx: AsyncContext, classes: string[]) => ClassOrder;
  getConflictingClasses: (ctx: AsyncContext, classes: string[]) => ConflictingClasses;
  getCustomComponentClasses: (ctx: AsyncContext) => CustomComponentClasses;
  getDissectedClasses: (ctx: AsyncContext, classes: string[]) => DissectedClasses;
  getPrefix: (ctx: AsyncContext) => { prefix: Prefix; suffix: Suffix; };
  getUnknownClasses: (ctx: AsyncContext, classes: string[]) => UnknownClass[];
  getVariantOrder: (ctx: AsyncContext, classes: string[]) => VariantOrder;
}

// the Tailwind CSS context an operation was computed from.
export interface TailwindContextInfo {
  // the files the context was built from, with the modification time they had when they were read.
  files: Record<string, number>;
  // changes whenever the worker builds the context again.
  version: number;
}

export interface OperationResponse<Result> {
  // undefined if the operation does not depend on the Tailwind CSS context.
  context: TailwindContextInfo | undefined;
  result: Result;
}

// mapped type variant that enables correlated generic dispatch https://github.com/microsoft/TypeScript/issues/30581
export type OperationHandlers = {
  [Operation in keyof Operations]: (...args: Parameters<Operations[Operation]>) => Promise<ReturnType<Operations[Operation]>>;
};

export type RunOperation = <Operation extends keyof Operations>(operation: Operation, ...args: Parameters<Operations[Operation]>) => OperationResponse<ReturnType<Operations[Operation]>>;
