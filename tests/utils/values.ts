export function values(message: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((msg, [key, value]) => {
    return msg.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value);
  }, message);
}
