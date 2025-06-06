# better-tailwindcss/no-unregistered-classes

Disallow unregistered classes in tailwindcss class strings. Unregistered classes are classes that are not defined in your tailwind config file and therefore not recognized by tailwindcss.

<br/>

## Options

### `ignore`

  List of classes that should not report an error. The entries in this list are treated as regular expressions.
  
  The rule works, by checking the output that a given class will produce. By default, the utilities `group` and `peer` are ignored, because they don't produce any css output.
  
  If you want to customize the ignore list, it is recommended to add the default options to the ignore override. You can use the function `getDefaultIgnoredUnregisteredClasses()` exported from `/api/defaults` to get the original ignore list.

  **Type**: `string[]`  
  **Default**: `["^group(?:\\/(\\S*))?$", "^peer(?:\\/(\\S*))?$"]`

<br/>

### `attributes`

  The name of the attribute that contains the tailwind classes. This can also be set globally via the [`settings` object](../settings/settings.md#attributes).  

  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Name](../configuration/advanced.md#name-based-matching) for `"class"` and [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"class", "className"`

<br/>

### `callees`

  List of function names which arguments should also get linted. This can also be set globally via the [`settings` object](../settings/settings.md#callees).  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Matchers](../configuration/advanced.md#types-of-matchers) for `"cc", "clb", "clsx", "cn", "cnb", "ctl", "cva", "cx", "dcnb", "objstr", "tv", "twJoin", "twMerge"`

<br/>

### `variables`

  List of variable names whose initializer should also get linted. This can also be set globally via the [`settings` object](../settings/settings.md#variables).  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**:  [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"className", "classNames", "classes", "style", "styles"`

<br/>

### `tags`

  List of template literal tag names whose content should get linted. This can also be set globally via the [`settings` object](../settings/settings.md#tags).  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: None

  Note: When using the `tags` option, it is recommended to use the [strings Matcher](../configuration/advanced.md#types-of-matchers) for your tag names. This will ensure that nested expressions get linted correctly.

<br/>

## Examples

```tsx
// ❌ BAD: unregistered class
<div class="my-class" />;
```

```tsx
// ✅ GOOD: only valid tailwindcss classes
<div class="font-bold hover:underline" />;
```
