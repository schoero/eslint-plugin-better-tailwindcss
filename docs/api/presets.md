# Presets

Presets are the recommended way to tell the plugin where your Tailwind classes are. List the presets of your framework and the [utilities](../../README.md#2-choose-your-utilities) you use by name in the `selectors` setting. This way, only the strings your project actually uses get linted, which avoids false positives.

Without `selectors`, the plugin falls back to a broad set of [selectors](../configuration/advanced.md#selectors) that covers all supported frameworks and utilities at once. See the [defaults documentation](./defaults.md) for the full list.

Each preset name stands for a set of selectors. Presets can be freely combined with each other and with your own custom selectors, and since they are plain strings, they work in JSON configs such as `.eslintrc.json` or `.oxlintrc.json` as well. Unknown names are ignored with a warning.

> [!NOTE]
> Providing `selectors` as an array **replaces** the defaults. Only the presets and selectors you list will be linted.

The defaults only contain the syntaxes that are safe to lint in every framework. Some syntaxes are only part of a framework preset, because their meaning differs between frameworks:

- `svelte` and `qwik`: object keys in `class={{ ... }}`
- `solid`: strings in `classList="..."`

To keep the defaults and add the syntaxes of a preset, pass it to [`extends`](../settings/settings.md#selectors) instead:

```js
export default {
  settings: {
    "better-tailwindcss": {
      selectors: {
        extends: ["svelte"]
      }
    }
  }
};
```

<br/>
<br/>

## Usage

```js
// eslint.config.js
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";

export default defineConfig({
  plugins: {
    "better-tailwindcss": eslintPluginBetterTailwindcss
  },
  settings: {
    "better-tailwindcss": {
      entryPoint: "app/globals.css",
      selectors: ["react", "cn", "clsx", "cva", "variables"]
    }
  }
});
```

<br/>
<br/>

## Frameworks

Framework presets contain [attribute selectors](../configuration/advanced.md#attribute) only.

| Preset    | Lints                                                                                  |
| --------- | -------------------------------------------------------------------------------------- |
| `html`    | `class="..."`, `class={...}`                                                           |
| `react`   | `className="..."`, `className={...}`                                                   |
| `preact`  | everything in `html` and `react`                                                       |
| `qwik`    | everything in `html`, `class={{ ... }}`, `class={[...]}`                               |
| `solid`   | everything in `html`, `classList="..."`, `classList={{ ... }}`                         |
| `vue`     | everything in `html`, `:class="..."`, `v-bind:class="..."`                             |
| `svelte`  | everything in `html`, `class={{ ... }}`, `class={[...]}`, `class:name={...}`           |
| `astro`   | everything in `html`, `class:list={...}`                                               |
| `angular` | everything in `html`, `[class]="..."`, `[ngClass]="..."`, `[class.name]="..."`         |

Frameworks that are not listed and use the plain `class` attribute can use the `html` preset.

### Multiple frameworks

Some frameworks give the same attribute different meanings. For example, Svelte and Qwik treat the object keys in `class={{ ... }}` as classes, while in other frameworks they are not classes. If your project uses more than one framework, apply each preset only to the files of its framework so that each file is linted with the right selectors:

```js
// eslint.config.js

export default [
  {
    files: ["**/*.svelte"],
    settings: {
      "better-tailwindcss": {
        selectors: ["svelte"]
      }
    }
  },
  {
    files: ["**/*.{jsx,tsx}"],
    settings: {
      "better-tailwindcss": {
        selectors: ["react"]
      }
    }
  }
];
```

<br/>
<br/>

## Utilities

Utility presets contain [callee](../configuration/advanced.md#callee) and [tag](../configuration/advanced.md#tag) selectors.

| Preset    | Utility                                                                                  |
| --------- | ---------------------------------------------------------------------------------------- |
| `twMerge` | [tailwind merge](https://github.com/dcastil/tailwind-merge): `twMerge`                   |
| `twJoin`  | [tailwind merge](https://github.com/dcastil/tailwind-merge): `twJoin`                    |
| `cva`     | [class variance authority](https://github.com/joe-bell/cva): `cva`                       |
| `cx`      | [class variance authority](https://github.com/joe-bell/cva): `cx`                        |
| `tv`      | [tailwind variants](https://github.com/nextui-org/tailwind-variants): `tv`               |
| `cn`      | [shadcn](https://ui.shadcn.com/docs/installation/manual): `cn`                           |
| `cc`      | [classcat](https://github.com/jorgebucaran/classcat): `cc`                               |
| `clb`     | [class list builder](https://github.com/crswll/clb): `clb`                               |
| `clsx`    | [clsx](https://github.com/lukeed/clsx): `clsx`                                           |
| `cnb`     | [cnbuilder](https://github.com/xobotyi/cnbuilder): `cnb`                                 |
| `dcnb`    | [cnbuilder](https://github.com/xobotyi/cnbuilder): `dcnb`                                |
| `ctl`     | [classnames template literals](https://github.com/netlify/classnames-template-literals) |
| `objstr`  | [obj str](https://github.com/lukeed/obj-str): `objstr`                                   |
| `twc`     | [react-twc](https://github.com/gregberge/twc): `twc`                                     |
| `twx`     | [react-twc](https://github.com/gregberge/twc): `twx`                                     |

<br/>
<br/>

## Variables

The `variables` preset contains the default [variable selectors](../configuration/advanced.md#variable). It lints string values of variables named `className`, `classNames`, `classes`, `style` and `styles`.

<br/>
<br/>

## Combining with custom selectors

Presets can be combined with your own selectors:

```js
export default {
  settings: {
    "better-tailwindcss": {
      selectors: [
        "react",
        "cn",
        {
          kind: "callee",
          match: [{ type: "strings" }],
          name: "^myFunction$"
        }
      ]
    }
  }
};
```
