/**
 * Coerce any value into a plain display string. AI-generated content sometimes returns objects where
 * a string is expected (e.g. an option as `{ word, meaning }` or `{ arabic, english }`), which crashes
 * React with "Objects are not valid as a React child" (#31). This guarantees a string every time.
 */
export function toPlainText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(toPlainText).filter(Boolean).join(' ');
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const preferred = o.text ?? o.word ?? o.arabic ?? o.value ?? o.label ?? o.option ?? o.answer ?? o.english ?? o.en;
    if (preferred != null) return toPlainText(preferred);
    const values = Object.values(o);
    return values.length ? toPlainText(values[0]) : '';
  }
  return String(v);
}
