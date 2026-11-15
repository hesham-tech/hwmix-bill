import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { join } from 'node:path';

const api = 'https://staging-api.hwnix.com/api/v1';
const revision = process.env.GITHUB_SHA;
assert.match(revision ?? '', /^[a-f0-9]{40}$/);
assert.equal(process.env.VITE_API_BASE_URL, api);
assert.equal(process.env.VITE_API_URL, api);
assert.equal(process.env.VITE_APP_ENV, 'staging');

// Change only the built staging artifact, retaining production source unchanged.
const htaccess = readFileSync('public/.htaccess', 'utf8')
  .replaceAll('https://bill-api.hwnix.com', 'https://staging-api.hwnix.com');
writeFileSync('dist/.htaccess', `${htaccess}\n<IfModule mod_headers.c>\nHeader set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n`);
writeFileSync('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
writeFileSync('dist/staging-revision.txt', `${revision}\n`);
// The standalone legal page is copied from public without Vite env replacement.
const legal = readFileSync('dist/legal.html', 'utf8')
  .replaceAll('https://bill-api.hwnix.com', 'https://staging-api.hwnix.com');
writeFileSync('dist/legal.html', legal);
for (const [extension, compress] of [['gz', gzipSync], ['br', brotliCompressSync]]) {
  if (existsSync(`dist/legal.html.${extension}`)) {
    writeFileSync(`dist/legal.html.${extension}`, compress(Buffer.from(legal)));
  }
}
let references = 0;
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) inspect(path);
    else if (/\.(js|html)$/.test(entry.name) || entry.name === '.htaccess') {
      const content = readFileSync(path, 'utf8');
      assert(!content.includes('https://bill-api.hwnix.com'), `Production API reference in ${path}`);
      assert(!content.includes('https://api-teste.hwnix.com'), `Legacy test API reference in ${path}`);
      if (content.includes(api)) references++;
    }
  }
}
inspect('dist');
assert(references > 0, 'Built output does not reference the staging API');
console.log(`Verified staging-only API references in ${references} output files.`);
