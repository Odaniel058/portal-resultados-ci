const fs = require('node:fs');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = {
  application: 'portal-resultados-ci',
  version: fs.readFileSync('version.txt', 'utf8').trim(),
  commit: process.env.GIT_COMMIT || git(['rev-parse', 'HEAD']),
  branch: process.env.GIT_BRANCH || git(['branch', '--show-current']),
  buildNumber: process.env.BUILD_NUMBER || 'local',
  generatedAt: new Date().toISOString(),
  artifacts: { 'index.html': hash('dist/index.html'), 'relatorio.json': hash('dist/relatorio.json') }
};
fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`MANIFESTO GERADO PARA O COMMIT ${manifest.commit}`);
