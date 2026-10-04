import { cn } from "../utils/helpers.js";

/**
 * component focused on single-class canonicalization targets and
 * repeated literals to exercise both the worker cache and the literal cache.
 */
export function Input() {
  const inputClasses = cn(
    // single-class canonicalization (arbitrary property → core utility).
    "[display:flex]",
    // single-class canonicalization (arbitrary ratio → named ratio).
    "aspect-[4/3]",
    // single-class canonicalization (arbitrary at-rule variant → named variant).
    "[@media_print]:flex",
    // single-class canonicalization (arbitrary data variant → named variant).
    "data-[is-selected]:opacity-100",
    // repeated baseline literal across files (cache stress test).
    "text-sm font-bold text-gray-700",
    // already-canonical border/focus utilities.
    "border border-gray-300 rounded-md focus:outline-none"
  );

  return <input class={inputClasses} />;
}
