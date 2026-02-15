# Advanced Configuration

The [rules](../../README.md#rules) in this plugin lint Tailwind classes inside string literals.

To do that safely, the plugin must know **which strings are expected to contain Tailwind classes**. If it would lint every string literal in your codebase, it would produce many false positives and potentially unsafe fixes.

The plugin already ships with defaults that support [most popular tailwind utilities](../../README.md#utilities). You only need advanced configuration when:

- you use custom utilities/APIs not covered by defaults,
- you want to narrow down linting behavior,
- or you want to lint additional locations.

To extend defaults instead of replacing them, import and spread `getDefaultSelectors()` from `eslint-plugin-better-tailwindcss/defaults`.

You can find the default selectors in the [defaults documentation](../defaults.md).

<br/>
<br/>

## Selectors

Selectors are a flat object-based configuration format.

Each selector targets one kind of source location and tells the plugin how to extract class strings from it.

- **kind**: what to match (`attribute`, `callee`, `variable`, `tag`)
- **name**: regular expression for the attribute/callee/variable/tag name
- **match** `optional`: which string literals to collect (`strings`, `objectKeys`, `objectValues`)
  When `match` is omitted, only the direct string literals will get collected.
- **callTarget** `optional`: which curried call to lint (`number`, `"all"`, `"first"`, `"last"`)
  `callTarget` only available for callee selectors. When `callTarget` is omitted, the first call in a curried chain is used.

### Type

```ts
type Selector = {
  kind: "attribute" | "callee" | "tag" | "variable";
  name: string;
  match?: {
    type: "objectKeys" | "objectValues" | "strings";
    pathPattern?: string;
  }[];
  callTarget?: number | "all" | "first" | "last";
};
```

### How name matching works

- Names are treated as regular expressions.
- Reserved regex characters must be escaped.
- The regex must match the whole name (not a substring).

<br/>

### Matcher types

There are 3 matcher types:

- `objectKeys`: matches all object keys
- `objectValues`: matches all object values
- `strings`: matches all string literals that are not object keys or values

<br/>

### `pathPattern`

`pathPattern` lets you narrow `objectKeys` and `objectValues` matching to specific object paths.

This is especially useful for libraries like [Class Variance Authority (cva)](https://cva.style/docs/getting-started/installation#intellisense), where class names appear in nested object structures.

`pathPattern` is a regex matched against the object path.  

For example, the following matcher will only match object values for the `compoundVariants.class` key:

<br/>

```json
{
  "type": "objectValues",
  "pathPattern": "^compoundVariants\\[\\d+\\]\\.(?:className|class)$"
}
```

```tsx
<img class={
  cva("this will not get linted", {
    compoundVariants: [
      {
        class: "but this will get linted",
        myVariant: "and this will not get linted"
      }
    ]
  })
} />;
```

<br/>

The path reflects how the string is nested in the object:

- Dot notation for plain keys: `root.nested.values`
- Square brackets for arrays: `values[0]`
- Quoted brackets for special characters: `root["some-key"]`

For example, the object path for `value` in the object below is `root["nested-key"].values[0].value`:

```json
{
  "root": {
    "nested-key": {
      "values": [
        {
          "value": "this will get linted"
        }
      ]
    }
  }
}
```

### Callee `callTarget`

Use `callTarget` on callee selectors to control which call in a curried chain gets linted.

- `"first"`: first call in the chain (`fn("a")("b")` → lint `"a"`)
- `"last"`: last call in the chain (`fn("a")("b")` → lint `"b"`)
- `"all"`: lint all calls in the chain
- `number`: zero-based call index (`0` first, `1` second, etc.)
- negative number: index from the end (`-1` last)

```jsonc
{
  "selectors": [
    {
      "kind": "callee",
      "name": "^classNames$",
      "callTarget": "last"
    }
  ]
}
```

<br/>

### Examples

#### Example: lint `cva` strings + specific nested values

```jsonc
{
  "selectors": [
    {
      "kind": "callee",
      "name": "^cva$",
      "match": [
        {
          "type": "strings"
        },
        {
          "type": "objectValues",
          "pathPattern": "^compoundVariants\\[\\d+\\]\\.(?:className|class)$"
        }
      ]
    }
  ]
}
```

```tsx
<img class={
  cva("this will get linted", {
    compoundVariants: [
      {
        class: "and this will get linted",
        myVariant: "but this will not get linted"
      }
    ]
  })
} />;
```

#### Full example: custom Algolia attribute selector

You can match custom attributes by modifying your `selectors` configuration. Here is an example on how to match the values inside the Algolia `classNames` objects:

```tsx
<SearchBox
  classNames={{
    form: "relative",
    root: "p-3 shadow-sm"
  }}
/>;
```

<br/>

```js
// eslint.config.js
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import { SelectorKind } from "eslint-plugin-better-tailwindcss/types";
import { defineConfig } from "eslint/config";

export default defineConfig({
  plugins: {
    "better-tailwindcss": eslintPluginBetterTailwindcss
  },
  settings: {
    "better-tailwindcss": {
      entryPoint: "app/globals.css",
      selectors: [
        ...getDefaultSelectors(), // preserve default selectors
        {
          kind: SelectorKind.Attribute,
          match: [{ type: "objectValues" }],
          name: "^classNames$"
        }
      ]
    }
  }
});
// ...
```
