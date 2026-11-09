import { array, looseObject, optional, pipe, tuple, union } from "valibot";

import type { GenericSchema } from "valibot";


// converts all object schemas to loose object schemas, so that unknown keys are neither reported nor removed
export function toLooseSchema(schema: any): GenericSchema {
  if(Array.isArray(schema.pipe)){
    const [base, ...actions] = schema.pipe;
    return pipe(toLooseSchema(base), ...actions);
  }

  switch (schema.type){
    case "object":
    case "strict_object":
      return looseObject(Object.fromEntries(
        Object.entries(schema.entries).map(([key, entry]) => [key, toLooseSchema(entry)])
      ));
    case "array":
      return array(toLooseSchema(schema.item));
    case "optional":
      return optional(toLooseSchema(schema.wrapped), schema.default);
    case "tuple":
      return tuple(schema.items.map(toLooseSchema));
    case "union":
      return union(schema.options.map(toLooseSchema));
    default:
      return schema;
  }
}

export function removeDefaults(entries: Record<string, any>) {
  const newEntries = { ...entries };
  for(const key in newEntries){
    const schema = { ...newEntries[key] };
    if("default" in schema){
      delete schema.default;
    }
    newEntries[key] = schema;
  }
  return newEntries;
}
