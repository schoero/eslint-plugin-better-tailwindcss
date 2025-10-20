# better-tailwindcss/enforce-canonical-classes

Implements the [canonical suggestions](https://github.com/tailwindlabs/tailwindcss/pull/19059) from Tailwindcss `^4.1.15`.
A canonical class is a simpler representation of a less optimal way of writing the same class. This can be the case when arbitrary values or variants are used while a predefined value exists for example.

> [!NOTE]
> This rule is identical to `suggestCanonicalClasses` from the [TailwindCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) VSCode extension. It is recommended to disable `suggestCanonicalClasses` in your projects `.vscode/settings.json` to avoid confusion:
>
> ```jsonc
> {
>   "tailwindCSS.lint.suggestCanonicalClasses": "ignore"
> }
> ```

<br/>

## Options

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `attributes`

  The name of the attribute that contains the tailwind classes.  

  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Name](../configuration/advanced.md#name-based-matching) for `"class"` and [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"class", "className"`

  <br/>

### `callees`

  List of function names which arguments should also get linted.
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Matchers](../configuration/advanced.md#types-of-matchers) for `"cc", "clb", "clsx", "cn", "cnb", "ctl", "cva", "cx", "dcnb", "objstr", "tv", "twJoin", "twMerge"`

  <br/>

### `variables`

  List of variable names whose initializer should also get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**:  [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"className", "classNames", "classes", "style", "styles"`

  <br/>

### `tags`

  List of template literal tag names whose content should get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: None

  Note: When using the `tags` option, it is recommended to use the [strings Matcher](../configuration/advanced.md#types-of-matchers) for your tag names. This will ensure that nested expressions get linted correctly.

</details>

<br/>

## Examples

```tsx
// ❌ BAD: using unnecessary arbitrary value
<div class="[display:flex]" />;
```

```tsx
// ✅ GOOD: using canonical class for display flex
<div class="flex" />;
```

```tsx
// ❌ BAD: using separate width and height classes
<div class="data-[is-selected]:opacity-100" />;
```

```tsx
// ✅ GOOD: using canonical size class
<div class="data-is-selected:opacity-100" />;
```
