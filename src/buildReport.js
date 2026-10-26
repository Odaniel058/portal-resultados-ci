const fs = require('node:fs');
const { validateDataset } = require('./validateCandidates');
const dataset = JSON.parse(fs.readFileSync('data/candidatos.json', 'utf8'));
const errors = validateDataset(dataset);
if (errors.length) throw new Error(`build interrompido: ${errors.join('; ')}`);
const approved = dataset.candidates.filter(c => c.status === 'APROVADO')
  .map(({ registration, name, score }) => ({ registration, name, score }));
const report = {
  process: dataset.metadata.processo,
  version: dataset.metadata.version,
  generatedAt: new Date().toISOString(),
  summary: { total: dataset.candidates.length, approved: approved.length, waiting: dataset.candidates.length - approved.length },
  approved
};
fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('public/index.html', 'dist/index.html');
fs.writeFileSync('dist/relatorio.json', JSON.stringify(report, null, 2) + '\n');
console.log(`RELATÓRIO GERADO: ${approved.length} aprovados de ${report.summary.total} candidatos`);
