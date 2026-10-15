/**
 * Gives every @magflip package the same version.
 *
 * The packages are released together - minjs bundles all of them - so they
 * share one version, and a package that needs another asks for that same
 * version. Run it once per release, before building:
 *
 *   npm run version:set -- 0.6.0
 *
 * It rewrites `version` in packages/<name>/package.json and every @magflip/*
 * range in their dependencies to `^<version>`. Run `npm install` afterwards so
 * package-lock.json follows.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGES_DIR = join(ROOT, 'packages');
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies'];

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error('Usage: npm run version:set -- <major.minor.patch>');
  process.exit(1);
}

const names = (await readdir(PACKAGES_DIR, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

for (const name of names) {
  const file = join(PACKAGES_DIR, name, 'package.json');
  const json = JSON.parse(await readFile(file, 'utf8'));
  const before = json.version;
  json.version = version;

  for (const field of DEPENDENCY_FIELDS) {
    for (const dependency of Object.keys(json[field] ?? {})) {
      if (dependency.startsWith('@magflip/')) { json[field][dependency] = `^${version}`; }
    }
  }

  await writeFile(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${json.name.padEnd(20)} ${before} → ${version}`);
}
