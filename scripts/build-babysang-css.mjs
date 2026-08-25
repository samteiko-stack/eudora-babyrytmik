import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'public/css');
const outFile = path.join(outDir, 'babysang.css');

const sources = [
  'app/webflow-normalize.css',
  'app/webflow.css',
  'app/eudora-webflow.css',
  'app/webflow-overrides.css',
];

function scopeSiteGlobals(css) {
  return css
    .replace(/\nbody\s*\{/g, '\n.babysang-site {')
    .replace(/\nhtml\s*\{\s*\n\s*height:\s*100%;\s*\n\}/g, '\n/* html height handled by .babysang-site */')
    .replace(/url\('\.\/fonts\//g, "url('/fonts/");
}

function patchAssetUrls(css) {
  return css.replace(/url\('\/assets\//g, "url('/assets/");
}

let bundle = sources
  .map((file) => {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing stylesheet: ${file}`);
    }
    return `/* ${file} */\n${fs.readFileSync(fullPath, 'utf8')}`;
  })
  .join('\n\n');

bundle = scopeSiteGlobals(bundle);
bundle = patchAssetUrls(bundle);

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'public/fonts'), { recursive: true });

for (const font of ['GeistVariable.ttf', 'Nohemi-VF.ttf']) {
  const src = path.join(root, 'app/fonts', font);
  const dest = path.join(root, 'public/fonts', font);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

fs.writeFileSync(outFile, bundle);
console.log(`Built ${outFile} (${bundle.length} bytes)`);
