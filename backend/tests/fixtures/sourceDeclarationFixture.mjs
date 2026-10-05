import assert from 'node:assert/strict';

// Fixture-only extraction for the repository's column-zero function declarations.
// Nested closing braces are indented. No production implementation is copied here.
export function declarationSource(source, name) {
  assert(/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name));
  const marker = 'function ' + name + '(';
  const start = source.indexOf(marker);
  assert(start >= 0 && source.indexOf(marker, start + marker.length) === -1, 'Unique named declaration required');
  const closing = source.indexOf('\n}', start + marker.length);
  assert(closing > start, 'Named declaration closing boundary required');
  return source.slice(start, closing + 2);
}
export function existingDeclaration(source, name) {
  return new Function(declarationSource(source, name) + '\nreturn ' + name + ';')();
}
