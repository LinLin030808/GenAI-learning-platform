// Pure helpers for keeping lesson / activity positions contiguous (0, 1, 2, ...).

/** Returns a copy of `ids` with `id` moved one step up or down. Unknown id or edge = unchanged. */
export function moveItem<T>(ids: readonly T[], id: T, direction: 'up' | 'down'): T[] {
  const out = [...ids];
  const from = out.indexOf(id);
  if (from === -1) return out;
  const to = direction === 'up' ? from - 1 : from + 1;
  if (to < 0 || to >= out.length) return out;
  const a = out[from] as T;
  out[from] = out[to] as T;
  out[to] = a;
  return out;
}

/** Splits "a, b ,, c" into ['a', 'b', 'c'], trimmed, deduplicated, max `limit`. */
export function parseTags(raw: string, limit = 6): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const tag = part.trim().slice(0, 30);
    if (tag) seen.add(tag);
  }
  return [...seen].slice(0, limit);
}

/** Turns zod issues into one readable line each, e.g. "questions.0.options: Too small". */
export function formatIssues(issues: { path: PropertyKey[]; message: string }[], max = 6): string {
  const lines = issues.slice(0, max).map((i) => {
    const path = i.path.map(String).join('.');
    return path ? `${path}: ${i.message}` : i.message;
  });
  if (issues.length > max) lines.push(`…and ${issues.length - max} more`);
  return lines.join('\n');
}
