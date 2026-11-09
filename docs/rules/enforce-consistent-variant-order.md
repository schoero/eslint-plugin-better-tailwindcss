# better-tailwindcss/enforce-consistent-variant-order

Enforce Tailwind CSS variant order for class names.

<br/>

## Options

This rule has no custom options.

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `selectors`

  Selectors that determine where Tailwind class strings are linted.

  By default, a rule uses the selectors from the [settings](../settings/settings.md#selectors), or the [default selectors](../api/defaults.md) if the settings don't configure any.

  Pass an array to replace these selectors with your own, or an object with an `extends` array to keep these selectors and lint additional ones.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors) or an object with an `extends` array of [Selectors](../configuration/advanced.md#selectors)
  **Default**: See [defaults API](../api/defaults.md)

</details>

<br/>

## Examples

```tsx
// ❌ BAD: variants are not in Tailwind's recommended order
<div class="hover:lg:text-red-500" />;
```

```tsx
// ✅ GOOD: variants follow Tailwind's recommended order
<div class="lg:hover:text-red-500" />;
```

<br/>

> [!NOTE]
> This rule only enforces variant order for Tailwind CSS v4 projects.
