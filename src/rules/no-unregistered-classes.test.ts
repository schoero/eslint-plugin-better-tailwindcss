import { getTailwindcssVersion, TailwindcssVersion } from "src/async-utils/version.js";
import { describe, it } from "vitest";

import { noUnregisteredClasses } from "better-tailwindcss:rules/no-unregistered-classes.js";
import { lint, TEST_SYNTAXES } from "better-tailwindcss:tests/utils/lint.js";
import { css, ts } from "better-tailwindcss:tests/utils/template.js";


describe(noUnregisteredClasses.name, () => {

  it("should not report standard tailwind classes", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="flex" />`,
            html: `<img class="flex" />`,
            jsx: `() => <img class="flex" />`,
            svelte: `<img class="flex" />`,
            vue: `<template><img class="flex" /></template>`
          }
        ]
      }
    );
  });

  it("should not report standard tailwind classes with variants", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="hover:flex" />`,
            html: `<img class="hover:flex" />`,
            jsx: `() => <img class="hover:flex" />`,
            svelte: `<img class="hover:flex" />`,
            vue: `<template><img class="hover:flex" /></template>`
          }
        ]
      }
    );
  });

  it("should not report standard tailwind classes with many variants", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="dark:hover:before:inset-0" />`,
            html: `<img class="dark:hover:before:inset-0" />`,
            jsx: `() => <img class="dark:hover:before:inset-0" />`,
            svelte: `<img class="dark:hover:before:inset-0" />`,
            vue: `<template><img class="dark:hover:before:inset-0" /></template>`
          }
        ]
      }
    );
  });

  it("should report standard tailwind classes with an unregistered variant in many variants", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="dark:unregistered:before:inset-0" />`,
            html: `<img class="dark:unregistered:before:inset-0" />`,
            jsx: `() => <img class="dark:unregistered:before:inset-0" />`,
            svelte: `<img class="dark:unregistered:before:inset-0" />`,
            vue: `<template><img class="dark:unregistered:before:inset-0" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should not report on dynamic utility values in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="py-2.25" />`,
            html: `<img class="py-2.25" />`,
            jsx: `() => <img class="py-2.25" />`,
            svelte: `<img class="py-2.25" />`,
            vue: `<template><img class="py-2.25" /></template>`
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should report on dynamic utility values in tailwind <= 3", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="py-2.25" />`,
            html: `<img class="py-2.25" />`,
            jsx: `() => <img class="py-2.25" />`,
            svelte: `<img class="py-2.25" />`,
            vue: `<template><img class="py-2.25" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should report unregistered classes", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="unregistered" />`,
            html: `<img class="unregistered" />`,
            jsx: `() => <img class="unregistered" />`,
            svelte: `<img class="unregistered" />`,
            vue: `<template><img class="unregistered" /></template>`,

            errors: 1
          }
        ]
      }
    );
  });

  it("should be possible to whitelist classes in options", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="unregistered" />`,
            html: `<img class="unregistered" />`,
            jsx: `() => <img class="unregistered" />`,
            svelte: `<img class="unregistered" />`,
            vue: `<template><img class="unregistered" /></template>`,

            options: [{ ignore: ["unregistered"] }]
          }
        ]
      }
    );
  });

  it("should be possible to whitelist classes in options via regex", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="ignored-unregistered" />`,
            html: `<img class="ignored-unregistered" />`,
            jsx: `() => <img class="ignored-unregistered" />`,
            svelte: `<img class="ignored-unregistered" />`,
            vue: `<template><img class="ignored-unregistered" /></template>`,

            options: [{ ignore: ["^ignored-.*$"] }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should not report on registered utility classes in tailwind <= 3", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            html: `<img class="unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            jsx: `() => <img class="unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            svelte: `<img class="unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            vue: `<template><img class="unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" /></template>`,

            errors: 1,
            files: {
              "plugin.js": ts`
                export function plugin() {
                  return function({ addUtilities }) {
                    addUtilities({
                      ".in-plugin": {
                        color: "red"
                      }
                    });
                  };
                }
              `,
              "tailwind.config.color.js": ts`
                import { plugin } from "./plugin.js";

                export default {
                  plugins: [
                    plugin()
                  ],
                  theme: {
                    extend: {
                      colors: {
                        config: "red"
                      }
                    }
                  }
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.color.js"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should not report on registered utility classes in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="in-utility unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            html: `<img class="in-utility unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            jsx: `() => <img class="in-utility unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            svelte: `<img class="in-utility unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" />`,
            vue: `<template><img class="in-utility unregistered in-plugin text-config hover:before:in-plugin hover:before:text-config" /></template>`,

            errors: 1,
            files: {
              "plugin.js": ts`
                import createPlugin from "tailwindcss/plugin";

                export default createPlugin(({ addUtilities }) => {
                  addUtilities({
                    ".in-plugin": {
                      color: "red"
                    }
                  });
                });
              `,
              "tailwind.config.js": ts`
                export default {
                  theme: {
                    extend: {
                      colors: {
                        config: "red"
                      }
                    }
                  }
                };
              `,
              "tailwind.css": css`
                @import "tailwindcss";

                @config "./tailwind.config.js";
                @plugin "./plugin.js";

                @utility in-utility {
                  @apply text-red-500;
                }
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should ignore custom component classes defined in the component layer in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="custom-component unregistered" />`,
            html: `<img class="custom-component unregistered" />`,
            jsx: `() => <img class="custom-component unregistered" />`,
            svelte: `<img class="custom-component unregistered" />`,
            vue: `<template><img class="custom-component unregistered" /></template>`,

            errors: 1,

            files: {
              "tailwind.css": css`
                @import "tailwindcss";

                @layer components {
                  .custom-component {
                    @apply font-bold;
                  }
                }
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          }
        ],
        valid: [
          {
            angular: `<img class="custom-component" />`,
            html: `<img class="custom-component" />`,
            jsx: `() => <img class="custom-component" />`,
            svelte: `<img class="custom-component" />`,
            vue: `<template><img class="custom-component" /></template>`,

            files: {
              "tailwind.css": css`
                @import "tailwindcss";

                @layer components {
                  .custom-component {
                    @apply font-bold;
                  }
                }
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should ignore custom component classes defined in imported files in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="custom-component unregistered" />`,
            html: `<img class="custom-component unregistered" />`,
            jsx: `() => <img class="custom-component unregistered" />`,
            svelte: `<img class="custom-component unregistered" />`,
            vue: `<template><img class="custom-component unregistered" /></template>`,

            errors: 1,

            files: {
              "components.css": css`
                @layer components {
                  .custom-component {
                    @apply font-bold;
                  }
                }
              `,
              "tailwind.css": css`
                @import "tailwindcss";
                @import "./components.css";
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          },
          {
            angular: `<img class="custom-component unregistered" />`,
            html: `<img class="custom-component unregistered" />`,
            jsx: `() => <img class="custom-component unregistered" />`,
            svelte: `<img class="custom-component unregistered" />`,
            vue: `<template><img class="custom-component unregistered" /></template>`,

            errors: 1,

            files: {
              "nested/dir/components.css": css`
                @layer components {
                  .custom-component {
                    @apply font-bold;
                  }
                }
              `,
              "nested/import.css": css`
                @import "./dir/components.css";
              `,
              "tailwind.css": css`
                @import "tailwindcss";
                @import "./nested/import.css";
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should not crash when trying to read custom component classes in a file that doesn't exists in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="custom-component unregistered" />`,
            html: `<img class="custom-component unregistered" />`,
            jsx: `() => <img class="custom-component unregistered" />`,
            svelte: `<img class="custom-component unregistered" />`,
            vue: `<template><img class="custom-component unregistered" /></template>`,

            errors: 2,

            files: {
              "tailwind.css": css`
                @import "tailwindcss";
                @import "./does-not-exist.css";
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should work with prefixed tailwind classes tailwind <= 3", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="flex tw-flex hover:tw-flex"/>`,
            html: `<img class="flex tw-flex hover:tw-flex" />`,
            jsx: `() => <img class="flex tw-flex hover:tw-flex" />`,
            svelte: `<img class="flex tw-flex hover:tw-flex" />`,
            vue: `<template><img class="flex tw-flex hover:tw-flex" /></template>`,

            errors: 1,
            files: {
              "tailwind.config.prefix.js": ts`
                export default {
                  prefix: 'tw-',
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.prefix.js"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should work with prefixed tailwind classes tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="flex tw:flex tw:hover:flex"/>`,
            html: `<img class="flex tw:flex tw:hover:flex" />`,
            jsx: `() => <img class="flex tw:flex tw:hover:flex" />`,
            svelte: `<img class="flex tw:flex tw:hover:flex" />`,
            vue: `<template><img class="flex tw:flex tw:hover:flex" /></template>`,

            errors: 1,
            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it("should not report on groups and peers", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="group" />`,
            html: `<img class="group" />`,
            jsx: `() => <img class="group" />`,
            svelte: `<img class="group" />`,
            vue: `<template><img class="group" /></template>`
          },
          {
            angular: `<img class="peer" />`,
            html: `<img class="peer" />`,
            jsx: `() => <img class="peer" />`,
            svelte: `<img class="peer" />`,
            vue: `<template><img class="peer" /></template>`
          }
        ]
      }
    );
  });

  it("should not report on named groups and peers", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="group/custom-group" />`,
            html: `<img class="group/custom-group" />`,
            jsx: `() => <img class="group/custom-group" />`,
            svelte: `<img class="group/custom-group" />`,
            vue: `<template><img class="group/custom-group" /></template>`
          },
          {
            angular: `<img class="peer/custom-peer" />`,
            html: `<img class="peer/custom-peer" />`,
            jsx: `() => <img class="peer/custom-peer" />`,
            svelte: `<img class="peer/custom-peer" />`,
            vue: `<template><img class="peer/custom-peer" /></template>`
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should not report on prefixed groups and peers in tailwind <= 3", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="tw-group"/>`,
            html: `<img class="tw-group" />`,
            jsx: `() => <img class="tw-group" />`,
            svelte: `<img class="tw-group" />`,
            vue: `<template><img class="tw-group" /></template>`,

            files: {
              "tailwind.config.js": ts`
                export default {
                  prefix: 'tw-',
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.js"
            }]
          },
          {
            angular: `<img class="tw-peer"/>`,
            html: `<img class="tw-peer" />`,
            jsx: `() => <img class="tw-peer" />`,
            svelte: `<img class="tw-peer" />`,
            vue: `<template><img class="tw-peer" /></template>`,

            files: {
              "tailwind.config.js": ts`
                export default {
                  prefix: 'tw-',
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.js"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major <= TailwindcssVersion.V3)("should not report on prefixed named groups and peers in tailwind <= 3", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="tw-group/custom-group"/>`,
            html: `<img class="tw-group/custom-group" />`,
            jsx: `() => <img class="tw-group/custom-group" />`,
            svelte: `<img class="tw-group/custom-group" />`,
            vue: `<template><img class="tw-group/custom-group" /></template>`,

            files: {
              "tailwind.config.prefix.js": ts`
                export default {
                  prefix: 'tw-',
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.prefix.js"
            }]
          },
          {
            angular: `<img class="tw-peer/custom-peer"/>`,
            html: `<img class="tw-peer/custom-peer" />`,
            jsx: `() => <img class="tw-peer/custom-peer" />`,
            svelte: `<img class="tw-peer/custom-peer" />`,
            vue: `<template><img class="tw-peer/custom-peer" /></template>`,

            files: {
              "tailwind.config.js": ts`
                export default {
                  prefix: 'tw-',
                };
              `
            },
            options: [{
              tailwindConfig: "./tailwind.config.js"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should not report on prefixed groups and peers in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="tw:group"/>`,
            html: `<img class="tw:group" />`,
            jsx: `() => <img class="tw:group" />`,
            svelte: `<img class="tw:group" />`,
            vue: `<template><img class="tw:group" /></template>`,

            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          },
          {
            angular: `<img class="tw:peer"/>`,
            html: `<img class="tw:peer" />`,
            jsx: `() => <img class="tw:peer" />`,
            svelte: `<img class="tw:peer" />`,
            vue: `<template><img class="tw:peer" /></template>`,

            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should not report on prefixed named groups and peers in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="tw:group/custom-group"/>`,
            html: `<img class="tw:group/custom-group" />`,
            jsx: `() => <img class="tw:group/custom-group" />`,
            svelte: `<img class="tw:group/custom-group" />`,
            vue: `<template><img class="tw:group/custom-group" /></template>`,

            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          },
          {
            angular: `<img class="tw:peer/custom-peer"/>`,
            html: `<img class="tw:peer/custom-peer" />`,
            jsx: `() => <img class="tw:peer/custom-peer" />`,
            svelte: `<img class="tw:peer/custom-peer" />`,
            vue: `<template><img class="tw:peer/custom-peer" /></template>`,

            files: {
              "tailwind.css": css`
                @import "tailwindcss" prefix(tw);
              `
            },
            options: [{
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });

  it("should not report on tailwind utility classes with modifiers", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        valid: [
          {
            angular: `<img class="bg-red-500/50" />`,
            html: `<img class="bg-red-500/50" />`,
            jsx: `() => <img class="bg-red-500/50" />`,
            svelte: `<img class="bg-red-500/50" />`,
            vue: `<template><img class="bg-red-500/50" /></template>`
          },
          {
            angular: `<img class="hover:bg-red-500/50" />`,
            html: `<img class="hover:bg-red-500/50" />`,
            jsx: `() => <img class="hover:bg-red-500/50" />`,
            svelte: `<img class="hover:bg-red-500/50" />`,
            vue: `<template><img class="hover:bg-red-500/50" /></template>`
          }
        ]
      }
    );
  });

  it.runIf(getTailwindcssVersion().major >= TailwindcssVersion.V4)("should support tsconfig paths in tailwind >= 4", () => {
    lint(
      noUnregisteredClasses,
      TEST_SYNTAXES,
      {
        invalid: [
          {
            angular: `<img class="unregistered custom-component custom-utility custom-plugin"/>`,
            html: `<img class="unregistered custom-component custom-utility custom-plugin" />`,
            jsx: `() => <img class="unregistered custom-component custom-utility custom-plugin" />`,
            svelte: `<img class="unregistered custom-component custom-utility custom-plugin" />`,
            vue: `<template><img class="unregistered custom-component custom-utility custom-plugin" /></template>`,

            errors: 1,
            files: {
              "nested/components/custom-components.css": css`
                @layer components {
                  .custom-component {
                    @apply font-bold;
                  }
                }
              `,
              "nested/plugins/custom-plugin.js": ts`
                import createPlugin from "tailwindcss/plugin";

                export default createPlugin(({ addUtilities }) => {
                  addUtilities({
                    ".custom-plugin": {
                      fontWeight: "bold"
                    }
                  });
                });
              `,
              "nested/utilities/custom-utilities.css": css`
                @utility custom-utility {
                  font-weight: bold;
                }
              `,
              "tailwind.css": css`
                @import "tailwindcss"; 
                @import "@components/custom-components.css";
                @import "@utilities/custom-utilities.css";
                @plugin "@plugins/custom-plugin.js";
              `,
              "tsconfig.json": ts`
                {
                  "compilerOptions": {
                    "paths": {
                      "@components/*": ["./nested/components/*"],
                      "@utilities/*": ["./nested/utilities/*"],
                      "@plugins/*": ["./nested/plugins/*"]
                    }
                  }
                }
              `
            },
            options: [{
              detectComponentClasses: true,
              entryPoint: "./tailwind.css"
            }]
          }
        ]
      }
    );
  });
});
