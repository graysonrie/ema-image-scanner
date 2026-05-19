const IMAGE_PATH_PATTERN = /\.(jpe?g|png|gif|webp)$/i;

export function isImagePath(path: string): boolean {
  return IMAGE_PATH_PATTERN.test(path);
}

export function getFileName(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? path;
}

export function mergeImagePaths(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing);
  const merged = [...existing];

  for (const path of incoming) {
    if (!seen.has(path)) {
      seen.add(path);
      merged.push(path);
    }
  }

  return merged;
}
