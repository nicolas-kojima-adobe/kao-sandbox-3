import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dirname, '..');
const dist = path.join(root, 'dist');

const EXCLUDE = new Set(['node_modules', '.git', 'dist', 'coverage', 'logs']);

/** Recursive copy without fs.cpSync (Cloud Manager may run Node older than 16.7). */
function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((name) => {
      copyRecursiveSync(path.join(src, name), path.join(dest, name));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

fs.readdirSync(root, { withFileTypes: true }).forEach((entry) => {
  if (!EXCLUDE.has(entry.name)) {
    const from = path.join(root, entry.name);
    const to = path.join(dist, entry.name);
    copyRecursiveSync(from, to);
  }
});

// eslint-disable-next-line no-console -- build pipeline feedback
console.log('Build: static assets copied to dist/');
