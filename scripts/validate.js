'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const errors = [];

function walk(dir, extensions, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, extensions, result);
    else if (extensions.includes(path.extname(entry.name))) result.push(full);
  }
  return result;
}

for (const file of [...walk(path.join(publicDir, 'assets', 'js'), ['.js']), path.join(publicDir, 'completar-perfil.js'), path.join(root, 'server.js'), path.join(root, 'src', 'server.js'), path.join(root, 'src', 'config', 'paths.js')]) {
  try {
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
  } catch (error) {
    errors.push(`JavaScript inválido: ${path.relative(root, file)} — ${error.message}`);
  }
}

for (const file of walk(publicDir, ['.html'])) {
  const html = fs.readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(ref)) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? path.join(publicDir, clean) : path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) errors.push(`Referência ausente em ${path.relative(root, file)}: ${ref}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Validação concluída: JavaScript e referências locais estão corretos.');
