export function parseSemanticVersion(version: string): { major: number; minor: number; patch: number; identifier?: string; } {
  const [major, minor, patchString] = version.split(".");
  const [patch, identifier] = patchString.split("-");

  return { identifier, major: +major, minor: +minor, patch: +patch };
}
