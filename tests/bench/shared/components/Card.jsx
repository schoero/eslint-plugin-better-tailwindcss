import { twMerge } from "../utils/helpers.js";

/**
 * component that mixes helper calls with direct attributes and
 * includes collapsible class groups for `enforce-canonical-classes`.
 */
export function Card({ children }) {
  const cardClasses = twMerge(
    // collapsible group (top-/right-/bottom-/left- → inset-).
    "top-0 right-0 bottom-0 left-0",
    // collapsible group (w-/h- → size-).
    "w-10 h-10",
    // already-canonical spacing/shadow utilities.
    "p-4 shadow-lg rounded-lg"
  );

  return (
    <div class={cardClasses}>
      {children}
    </div>
  );
}
