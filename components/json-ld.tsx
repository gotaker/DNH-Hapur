/**
 * Server-rendered JSON-LD `<script>` block. Strings are escaped per OWASP so
 * the JSON is safe to inline regardless of source — even though we only use
 * author-controlled, schema-typed data.
 */
function escapeForHtml(value: string): string {
  return value.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export function JsonLd({ data }: { data: unknown }) {
  const html = escapeForHtml(JSON.stringify(data));
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
