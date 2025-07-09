export function replacePlaceholders(template: string, match: RegExpMatchArray | string[]): string {
  return template.replace(/\$(\d+)/g, (_, groupIndex) => {
    const index = Number(groupIndex);
    return match[index] ?? "";
  });
}
