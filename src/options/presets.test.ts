import { describe, expect, it, vi } from "vitest";

import { DEFAULT_SELECTORS } from "better-tailwindcss:options/default-options.js";
import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { getFilesInDirectory, lint } from "better-tailwindcss:tests/utils/lint.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import {
  angular,
  astro,
  html,
  preact,
  qwik,
  react,
  solid,
  svelte,
  variables,
  vue
} from "./presets.js";
import * as presets from "./presets.js";


const frameworkNames = getFilesInDirectory("./src/options/frameworks/")
  .map(file => file.replace(".ts", ""));

const frameworkPresets = Object.entries(presets)
  .filter(([name]) => frameworkNames.includes(name))
  .map(([, preset]) => preset);

describe("presets", () => {

  it("should export a preset for every utility", () => {
    const utilities = [
      ...getFilesInDirectory("./src/options/callees/"),
      ...getFilesInDirectory("./src/options/tags/")
    ].map(file => file.replace(".ts", ""));

    for(const utility of utilities){
      expect(presets).toHaveProperty(utility);
    }
  });

  it("should export a preset for every framework", () => {
    for(const framework of frameworkNames){
      expect(presets).toHaveProperty(framework);
    }
  });

  it("should only contain utility and variable selectors that are also part of the defaults", () => {
    const others = Object.values(presets).filter(preset => !frameworkPresets.includes(preset));

    for(const selector of others.flat()){
      expect(DEFAULT_SELECTORS).toContainEqual(selector);
    }
  });

  it("should only contain attribute selectors in framework presets", () => {
    for(const selector of frameworkPresets.flat()){
      expect(selector.kind).toBe(SelectorKind.Attribute);
    }
  });

  it("should lint the class attribute with the html preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          html: `<img class=" lint " />`,
          htmlOutput: `<img class="lint" />`,

          errors: 2,
          options: [{ selectors: html }]
        }
      ],
      valid: [
        {
          jsx: `<img class={{ " ignore ": true }} />`,

          options: [{ selectors: html }]
        },
        {
          svelte: `<img class={{ " ignore ": true }} />`,

          options: [{ selectors: html }]
        }
      ]
    });
  });

  it("should only lint the className attribute with the react preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img className=" lint " class=" ignore " />`,
          jsxOutput: `<img className="lint" class=" ignore " />`,

          errors: 2,
          options: [{ selectors: react }]
        },
        {
          jsx: `<img className={" lint "} />`,
          jsxOutput: `<img className={"lint"} />`,

          errors: 2,
          options: [{ selectors: react }]
        }
      ],
      valid: [
        {
          jsx: `<img className={{ " ignore ": true }} />`,

          options: [{ selectors: react }]
        }
      ]
    });
  });

  it("should lint the class and className attributes with the preact preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img class=" lint " className={" lint "} classList={{ " ignore ": true }} />`,
          jsxOutput: `<img class="lint" className={"lint"} classList={{ " ignore ": true }} />`,

          errors: 4,
          options: [{ selectors: preact }]
        }
      ]
    });
  });

  it("should only lint the class attribute with the qwik preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img class={[" lint ", " lint "]} className=" ignore " />`,
          jsxOutput: `<img class={["lint", "lint"]} className=" ignore " />`,

          errors: 4,
          options: [{ selectors: qwik }]
        },
        {
          jsx: `<img class={[" lint ", { " lint ": true, "a": " ignore " }]} />`,
          jsxOutput: `<img class={["lint", { "lint": true, "a": " ignore " }]} />`,

          errors: 4,
          options: [{ selectors: qwik }]
        }
      ]
    });
  });

  it("should lint the classList attribute with the solid preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img class=" lint " classList={{ " lint ": true }} className=" ignore " />`,
          jsxOutput: `<img class="lint" classList={{ "lint": true }} className=" ignore " />`,

          errors: 4,
          options: [{ selectors: solid }]
        },
        {
          jsx: `<img classList=" lint " />`,
          jsxOutput: `<img classList="lint" />`,

          errors: 2,
          options: [{ selectors: solid }]
        }
      ]
    });
  });

  it("should lint class bindings with the vue preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          vue: `<template><img class=" lint " :class="{ ' lint ': true }" /></template>`,
          vueOutput: `<template><img class="lint" :class="{ 'lint': true }" /></template>`,

          errors: 4,
          options: [{ selectors: vue }]
        }
      ]
    });
  });

  it("should lint class attributes with the svelte preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          svelte: `<img class=" lint " />`,
          svelteOutput: `<img class="lint" />`,

          errors: 2,
          options: [{ selectors: svelte }]
        },
        {
          svelte: `<img class={" lint "} />`,
          svelteOutput: `<img class={"lint"} />`,

          errors: 2,
          options: [{ selectors: svelte }]
        },
        {
          svelte: `<img class={{ " lint ": true, "a": " ignore " }} />`,
          svelteOutput: `<img class={{ "lint": true, "a": " ignore " }} />`,

          errors: 2,
          options: [{ selectors: svelte }]
        },
        {
          svelte: `<img class={[" lint ", { " lint ": true }]} />`,
          svelteOutput: `<img class={["lint", { "lint": true }]} />`,

          errors: 4,
          options: [{ selectors: svelte }]
        }
      ]
    });
  });

  it("should lint the class:list attribute with the astro preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          astro: `<img class=" lint " class:list={[" lint ", { " lint ": true }]} />`,
          astroOutput: `<img class="lint" class:list={["lint", { "lint": true }]} />`,

          errors: 6,
          options: [{ selectors: astro }]
        }
      ]
    });
  });

  it("should lint class bindings with the angular preset", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          angular: `<img class=" lint " [ngClass]="{ ' lint ': true }" [class]="' lint '" />`,
          angularOutput: `<img class="lint" [ngClass]="{ 'lint': true }" [class]="'lint'" />`,

          errors: 6,
          options: [{ selectors: angular }]
        }
      ]
    });
  });

  it("should extend the defaults without duplicate reports", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          svelte: `<img class=" lint " />`,
          svelteOutput: `<img class="lint" />`,

          errors: 2,
          options: [{ selectors: { extends: svelte } }]
        },
        {
          svelte: `<img class={{ " lint ": true }} />`,
          svelteOutput: `<img class={{ "lint": true }} />`,

          errors: 2,
          options: [{ selectors: { extends: svelte } }]
        },
        {
          jsx: `<img class={{ " lint ": true }} className=" lint " />`,
          jsxOutput: `<img class={{ "lint": true }} className="lint" />`,

          errors: 4,
          options: [{ selectors: { extends: qwik } }]
        },
        {
          jsx: `<img classList=" lint " />`,
          jsxOutput: `<img classList="lint" />`,

          errors: 2,
          options: [{ selectors: { extends: solid } }]
        }
      ]
    });
  });

  it("should resolve preset names", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          svelte: `<img class={{ " lint ": true }} />`,
          svelteOutput: `<img class={{ "lint": true }} />`,

          errors: 2,
          options: [{ selectors: ["svelte"] }]
        },
        {
          svelte: `<img class={{ " lint ": true }} />`,
          svelteOutput: `<img class={{ "lint": true }} />`,

          errors: 2,
          settings: { "better-tailwindcss": { selectors: ["svelte"] } }
        },
        {
          svelte: `<img class={{ " lint ": true }} />`,
          svelteOutput: `<img class={{ "lint": true }} />`,

          errors: 2,
          options: [{ selectors: { extends: ["svelte"] } }]
        },
        {
          svelte: `<img class={{ " lint ": true }} />`,
          svelteOutput: `<img class={{ "lint": true }} />`,

          errors: 2,
          settings: { "better-tailwindcss": { selectors: { extends: ["svelte"] } } }
        },
        {
          jsx: `<img className=" lint " />; clsx(" lint "); cn(" ignore ");`,
          jsxOutput: `<img className="lint" />; clsx("lint"); cn(" ignore ");`,

          errors: 4,
          options: [{ selectors: { extends: ["clsx"] } }],
          settings: { "better-tailwindcss": { selectors: ["react"] } }
        },
        {
          jsx: `<img className={cn(" lint ")} />; myFn(" lint "); clsx(" ignore ");`,
          jsxOutput: `<img className={cn("lint")} />; myFn("lint"); clsx(" ignore ");`,

          errors: 4,
          options: [{
            selectors: [
              "react",
              "cn",
              { kind: SelectorKind.Callee, match: [{ type: MatcherType.String }], name: "^myFn$" }
            ]
          }]
        }
      ]
    });
  });

  it("should ignore and warn about unknown preset names in the settings", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img className=" lint " />; clsx(" ignore ");`,
          jsxOutput: `<img className="lint" />; clsx(" ignore ");`,

          errors: 2,
          // @ts-expect-error - settings are not validated, so misspelled preset names can reach the plugin
          settings: { "better-tailwindcss": { selectors: ["react", "notAPreset"] } }
        }
      ]
    });

    expect(warn).toHaveBeenCalledWith(expect.anything(), expect.stringContaining("\"notAPreset\""));

    warn.mockRestore();
  });

  it("should be combinable", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `
            const classes = " lint ";
            <img className={cn(" lint ")} />;
            <img className={clsx(" ignore ")} />;
          `,
          jsxOutput: `
            const classes = "lint";
            <img className={cn("lint")} />;
            <img className={clsx(" ignore ")} />;
          `,

          errors: 4,
          options: [{ selectors: [...react, ...presets.cn, ...variables] }]
        }
      ]
    });
  });

});
