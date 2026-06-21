import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, '../src');

const ignoredDirs = new Set(['locales', 'dist', 'node_modules']);
const filePattern = /\.(jsx?|tsx?)$/;
const visibleText = /[A-Za-z][A-Za-z\s]{2,}|[\u0600-\u06FF]{2,}/;
const literalAttr = /\b(aria-label|title|placeholder)=(['"])([^'"]*[A-Za-z\u0600-\u06FF][^'"]*)\2/g;
const jsxText = />\s*([^<{}`]*[A-Za-z\u0600-\u06FF][^<{}`]*)\s*</g;

const allowedLiteral = (value) => {
  const text = value.trim();
  if (!text) return true;
  if (/^(https?:|mailto:|tel:|#|\/|\+?\d|[A-Z_][A-Z0-9_]*$)/.test(text)) return true;
  if (/^[\w.-]+@[\w.-]+$/.test(text)) return true;
  if (/^(PDF|CSV|Excel|Word|PowerPoint|WebP|JPEG|PNG|GIF|CVC|URL|ID|SKU|EGP|L\.E|Ctrl\+K)$/i.test(text)) return true;
  if (/^(John Doe|john@example\.com|010\.\.\.|Alpha, Beta\.\.\.|KLM-|Mona Abdelrahman|Al Noor Learning Center|Ms\. Mona Arabic)$/.test(text)) return true;
  return false;
};

const allowedLine = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('*')) return true;
  if (/\b(className|data-testid|id|key|type|name|value|href|to|path|endpoint|method|variant|size|rel|target|accept|autoComplete)=/.test(trimmed)) return true;
  if (/console\.|localStorage|sessionStorage|new Date|Intl\.|RegExp|querySelector|window\.|document\.|route\(|fetchApi/.test(trimmed)) return true;
  return false;
};

const walk = (directory, files = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath, files);
      continue;
    }
    if (filePattern.test(entry.name)) files.push(fullPath);
  }
  return files;
};

const findings = [];

for (const filePath of walk(srcRoot)) {
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');

  lines.forEach((line, index) => {
    if (allowedLine(line)) return;

    for (const match of line.matchAll(literalAttr)) {
      const value = match[3];
      if (visibleText.test(value) && !allowedLiteral(value)) {
        findings.push(`${relativePath}:${index + 1}: literal ${match[1]}="${value}"`);
      }
    }

    const firstLt = line.indexOf('<');
    const firstGt = line.indexOf('>');
    const canContainJsxText = firstLt !== -1 && firstGt !== -1 && firstLt < firstGt;

    if (!canContainJsxText) return;

    for (const match of line.matchAll(jsxText)) {
      const value = match[1].replace(/\s+/g, ' ').trim();
      if (visibleText.test(value) && !allowedLiteral(value) && !line.includes('{t(')) {
        findings.push(`${relativePath}:${index + 1}: JSX text "${value}"`);
      }
    }
  });
}

if (findings.length) {
  console.error(`Hardcoded i18n audit found ${findings.length} visible literal(s):`);
  console.error(findings.join('\n'));
  process.exit(1);
}

console.log('Hardcoded i18n audit passed.');
