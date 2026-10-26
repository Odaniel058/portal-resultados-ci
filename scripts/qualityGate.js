const fs = require('node:fs');
try {
  const report = JSON.parse(fs.readFileSync(process.argv[2] || 'dist/relatorio.json', 'utf8'));
  const errors = [];
  const summary = report.summary || {};
  if (!Number.isInteger(summary.total) || summary.total < 5) errors.push('o lote deve conter pelo menos 5 candidatos');
  for (const field of ['approved', 'waiting']) {
    if (!Number.isInteger(summary[field]) || summary[field] < 0) errors.push(`total ${field} inválido`);
  }
  if (summary.approved + summary.waiting !== summary.total) errors.push('totais do relatório são inconsistentes');
  if (!Array.isArray(report.approved)) errors.push('lista de aprovados ausente');
  else if (report.approved.length !== summary.approved) errors.push('quantidade de aprovados não corresponde ao resumo');
  if (errors.length) throw new Error(errors.join('; '));
  console.log('QUALITY GATE APROVADO');
} catch (error) {
  console.error(`QUALITY GATE REPROVADO: ${error.message}`);
  process.exitCode = 1;
}
