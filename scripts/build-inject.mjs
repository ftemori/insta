// Builds www/inject.js (used by the app) and dist/insta.user.js (for testing in Safari/Firefox).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const settings = JSON.parse(read('src/settings.json'));
const script = read('src/focus.js')
  .replace('__SETTINGS__', JSON.stringify(settings))
  .replace('__CSS__', JSON.stringify(read('src/focus.css')));

mkdirSync(join(root, 'www'), { recursive: true });
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'www/inject.js'), script);

const header = `// ==UserScript==
// @name         Insta focus
// @description  No Reels, no Explore grid, Following-only feed on instagram.com
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
`;
writeFileSync(join(root, 'dist/insta.user.js'), header + script);
console.log('Built www/inject.js and dist/insta.user.js');
