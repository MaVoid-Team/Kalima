import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesRoot = path.resolve(__dirname, '../src/locales');
const languages = ['en', 'ar'];

const flatten = (value, prefix = '') => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [[prefix, value]];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flatten(child, nextPrefix);
  });
};

const placeholders = (value) => {
  if (typeof value !== 'string') return [];
  return [...value.matchAll(/{{\s*([\w.]+)\s*}}|\{\s*([\w.]+)\s*\}/g)]
    .map((match) => match[1] || match[2])
    .sort();
};

const readJson = (language, namespace) => {
  const filePath = path.join(localesRoot, language, `${namespace}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const namespaces = fs
  .readdirSync(path.join(localesRoot, 'en'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .sort();

const failures = [];

for (const namespace of namespaces) {
  const byLanguage = Object.fromEntries(
    languages.map((language) => [language, Object.fromEntries(flatten(readJson(language, namespace)))])
  );

  const allKeys = new Set(languages.flatMap((language) => Object.keys(byLanguage[language])));

  for (const key of [...allKeys].sort()) {
    for (const language of languages) {
      if (!(key in byLanguage[language])) {
        failures.push(`${namespace}: missing ${language}.${key}`);
      }
    }

    if (languages.every((language) => key in byLanguage[language])) {
      const [first, second] = languages;
      const firstPlaceholders = placeholders(byLanguage[first][key]);
      const secondPlaceholders = placeholders(byLanguage[second][key]);
      if (JSON.stringify(firstPlaceholders) !== JSON.stringify(secondPlaceholders)) {
        failures.push(
          `${namespace}: placeholder mismatch ${key} ${first}={${firstPlaceholders.join(',')}} ${second}={${secondPlaceholders.join(',')}}`
        );
      }
    }
  }
}

if (failures.length) {
  console.error(`i18n audit failed with ${failures.length} issue(s):`);
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`i18n audit passed for ${languages.join('/')} across ${namespaces.length} namespaces.`);
