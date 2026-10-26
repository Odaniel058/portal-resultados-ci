const fs = require('node:fs');
const read = file => fs.readFileSync(file, 'utf8').trim();
try {
  const version = read('version.txt');
  const html = read('public/index.html');
  const versions = {
    'version.txt': version,
    'package.json': JSON.parse(read('package.json')).version,
    'data/candidatos.json': JSON.parse(read('data/candidatos.json')).metadata.version,
    'public/index.html': html.match(/data-release-version="([^"]+)"/)?.[1] || null
  };
  console.log('VERSÕES ENCONTRADAS');
  Object.entries(versions).forEach(([file, value]) => console.log(`- ${file}: ${value}`));
  if (!version || new Set(Object.values(versions)).size !== 1) throw new Error('Todos os artefatos devem declarar a mesma versão.');
  if (!html.includes(`Versão publicada: ${version}`)) throw new Error('O texto visível da página não corresponde ao version.txt.');
  console.log(`SINCRONIZAÇÃO APROVADA: ${version}`);
} catch (error) {
  console.error(`SINCRONIZAÇÃO REPROVADA: ${error.message}`);
  process.exitCode = 1;
}
