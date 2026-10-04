import { twMerge } from "../utils/helpers.js";

/**
 * modal overlay/backdrop with multiple collapsible groups and
 * real-world helper usage.
 */
export function Modal() {
  const overlayClasses = twMerge(
    // fixed positioning baseline.
    "fixed inset-0",
    // collapsible group repeated across files (w-/h- → size-).
    "w-10 h-10",
    // backdrop styling, already canonical.
    "bg-black/50 z-50 flex items-center justify-center"
  );

  const panelClasses = "bg-white rounded-lg p-6 shadow-xl max-w-md w-full";

  return (
    <div class={overlayClasses}>
      <div class={panelClasses}>Modal content</div>
    </div>
  );
}
