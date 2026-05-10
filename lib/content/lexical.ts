/**
 * Walk a Lexical editor JSON tree and concatenate text nodes into a
 * single plain-text string. For schema.org JSON-LD `description`
 * fields where the bio is too long for a meta description anyway —
 * callers typically `.slice(0, 160)` the result.
 *
 * Tolerant of malformed input (returns empty string) so a stale
 * fixture or migration glitch doesn't take down the page.
 */
export function lexicalToPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const parts: string[] = [];
  const root = (node as { root?: unknown }).root;
  if (root && typeof root === 'object') {
    walk(root, parts);
  } else {
    walk(node, parts);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function walk(node: unknown, parts: string[]): void {
  if (!node || typeof node !== 'object') return;
  const n = node as { text?: unknown; children?: unknown };
  if (typeof n.text === 'string' && n.text.length > 0) {
    parts.push(n.text);
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) walk(child, parts);
  }
}
