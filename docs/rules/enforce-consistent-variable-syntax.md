# better-tailwindcss/enforce-consistent-variable-syntax

Enforce consistent css variable syntax in Tailwind CSS class strings.

<br/>

> [!NOTE]
> This rule might interfere with [`better-tailwindcss/enforce-canonical-classes`](./enforce-canonical-classes.md) if both rules are enabled. It is recommended to use only one of them to avoid conflicting fixes.

<br/>

## Options

### `syntax`

  The syntax to enforce for css variables in Tailwind CSS class strings.

  The `shorthand` syntax uses the `(--variable)` syntax in Tailwind CSS v4 and `[--variable]` syntax in Tailwind CSS v3.

  **Type**: `"variable"` | `"shorthand"`  
  **Default**: `"shorthand"`

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `selectors`

  Flat list of selectors that determines where Tailwind class strings are linted.

  By default, a rule uses the selectors from the [settings](../settings/settings.md#selectors), or the [default selectors](../api/defaults.md) if the settings don't configure any.

  Pass an array to replace these selectors with your own, or an object with an `extends` array to keep these selectors and lint additional ones.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors) or an object with an `extends` array of [Selectors](../configuration/advanced.md#selectors)
  **Default**: See [defaults API](../api/defaults.md)

</details>

<br/>

## Examples

```tsx
// ❌ BAD: Incorrect css variable syntax with option `syntax: "shorthand"`
<div class="bg-[var(--primary)]" />;
```

```tsx
// ✅ GOOD: With option `syntax: "shorthand"` in Tailwind CSS v4
<div class="bg-(--primary)" />;
```

```tsx
// ✅ GOOD: With option `syntax: "shorthand"` in Tailwind CSS v3
<div class="bg-[--primary]" />;
```

```tsx
// ❌ BAD: Incorrect css variable syntax with option `syntax: "variable"` in Tailwind CSS v4
<div class="bg-(--primary)" />;
```

```tsx
// ❌ BAD: Incorrect css variable syntax with option `syntax: "variable"` in Tailwind CSS v3
<div class="bg-[--primary]" />;
```

```tsx
// ✅ GOOD: With option `syntax: "variable"`
<div class="bg-[var(--primary)]" />;
```
