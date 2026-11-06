import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { getIcons, getIconsCSS } from '@iconify/utils';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../', import.meta.url));
const names = new Set();
async function scan(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(vue|js|ts|json)$/.test(entry.name) && entry.name !== 'build-icons.js') {
      const source = await fs.readFile(path, 'utf8');
      for (const match of source.matchAll(/\b(ri|bxl)[-:]([a-z0-9]+(?:-[a-z0-9]+)*)/g)) names.add(match[1] + ':' + match[2]);
    }
  }
}
await scan(root);
const css = [];
for (const prefix of ['ri', 'bxl']) {
  const collection = JSON.parse(await fs.readFile(require.resolve('@iconify-json/' + prefix + '/icons.json'), 'utf8'));
  const selected = [...names].filter(name => name.startsWith(prefix + ':')).map(name => name.slice(prefix.length + 1)).filter(name => collection.icons[name] || collection.aliases?.[name]);
  const icons = getIcons(collection, selected);
  if (!icons) continue;
  css.push(getIconsCSS(icons, selected, { iconSelector: '.{prefix}-{name}' }));
  console.log(prefix + ': ' + selected.length + ' used icons');
}
await fs.writeFile(new URL('./icons.css', import.meta.url), css.join('\n'), 'utf8');
