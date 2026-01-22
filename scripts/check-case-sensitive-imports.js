#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'kalima-platform', 'frontend');
const srcDir = path.join(root, 'src');

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function isRelative(p) {
  return p.startsWith('./') || p.startsWith('../');
}

function fileExistsExact(fullPath) {
  try {
    const dir = path.dirname(fullPath);
    const name = path.basename(fullPath);
    const entries = fs.readdirSync(dir);
    return entries.includes(name);
  } catch (e) {
    return false;
  }
}

function tryResolveImport(importPath, sourceFile) {
  // Only handle relative imports
  if (!isRelative(importPath)) return { resolved: null, tried: [] };
  const base = path.dirname(sourceFile);
  const abs = path.resolve(base, importPath);
  const tried = [];

  // If path points to a file with extension
  const exts = ['.js', '.jsx', '.ts', '.tsx', '.json'];
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    tried.push(abs);
    return { resolved: abs, tried };
  }

  // Try with extensions
  for (const e of exts) {
    if (fs.existsSync(abs + e)) {
      tried.push(abs + e);
      return { resolved: abs + e, tried };
    }
  }

  // If directory, try index.*
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    tried.push(abs);
    for (const e of exts) {
      const idx = path.join(abs, 'index' + e);
      if (fs.existsSync(idx)) {
        tried.push(idx);
        return { resolved: idx, tried };
      }
    }
  }

  // As a last resort, try adding .js
  tried.push(abs + '.js');
  return { resolved: null, tried };
}

function getImportPaths(content) {
  const paths = new Set();
  const importRegex = /import\s+(?:[^'\"]+from\s+)?['\"]([^'\"]+)['\"]/g;
  const requireRegex = /require\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  let m;
  while ((m = importRegex.exec(content))) paths.add(m[1]);
  while ((m = requireRegex.exec(content))) paths.add(m[1]);
  return Array.from(paths);
}

function compareCase(resolvedPath) {
  // Walk up the path and compare each segment against actual dir entries
  const parts = path.relative(root, resolvedPath).split(path.sep);
  let cur = root;
  for (const part of parts) {
    if (!fs.existsSync(cur)) return false;
    const entries = fs.readdirSync(cur);
    if (!entries.includes(part)) return false;
    cur = path.join(cur, part);
  }
  return true;
}

function main() {
  console.log('Scanning frontend src for imports (this may take a few seconds)...');
  const files = walk(srcDir).filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
  const problems = [];

  for (const file of files) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    const imports = getImportPaths(content);
    for (const imp of imports) {
      if (!isRelative(imp)) continue; // skip packages
      const { resolved, tried } = tryResolveImport(imp, file);
      if (!resolved) {
        problems.push({file: rel, import: imp, issue: 'not_resolved', tried});
        continue;
      }
      const caseOk = compareCase(resolved);
      if (!caseOk) {
        problems.push({file: rel, import: imp, resolved: path.relative(root, resolved), issue: 'case_mismatch', tried});
      }
    }
  }

  if (problems.length === 0) {
    console.log('No relative import path issues found.');
    return;
  }

  console.log('\nFound potential issues:');
  problems.forEach(p => {
    console.log('- File:', p.file);
    console.log('  Import:', p.import);
    console.log('  Issue:', p.issue);
    if (p.resolved) console.log('  Resolved to:', p.resolved);
    if (p.tried && p.tried.length) {
      console.log('  Tried:', p.tried.slice(0,5).map(x => path.relative(root, x)));
    }
    console.log('');
  });
  console.log(`Total issues: ${problems.length}`);
}

main();
