const fs = require('node:fs');

function validateCandidate(candidate, index, minimumScore) {
  const errors = [];
  const prefix = `registro ${index + 1}`;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return [`${prefix}: candidato deve ser um objeto`];
  }
  for (const field of ['registration', 'cpf', 'name', 'score', 'status']) {
    const value = candidate[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${prefix}: campo obrigatório ausente: ${field}`);
    }
  }
  for (const field of ['registration', 'name']) {
    if (typeof candidate[field] !== 'string') errors.push(`${prefix}: ${field} deve ser texto`);
  }
  // O exercício verifica o formato, não os dígitos verificadores de um CPF real.
  if (typeof candidate.cpf !== 'string' || !/^\d{11}$/.test(candidate.cpf)) {
    errors.push(`${prefix}: CPF deve conter exatamente 11 dígitos em texto`);
  }
  if (!Number.isFinite(candidate.score) || candidate.score < 0 || candidate.score > 100) {
    errors.push(`${prefix}: nota fora do intervalo 0..100`);
  } else {
    const expected = candidate.score >= minimumScore ? 'APROVADO' : 'LISTA_ESPERA';
    if (candidate.status !== expected) errors.push(`${prefix}: status ${candidate.status} incompatível com nota ${candidate.score}; esperado ${expected}`);
  }
  return errors;
}

function validateDataset(dataset) {
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) return ['lote deve ser um objeto'];
  const errors = [];
  const metadata = dataset.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return ['metadata ausente'];
  if (!Array.isArray(dataset.candidates) || dataset.candidates.length === 0) return ['lista candidates ausente ou vazia'];
  const minimumScore = metadata.minimumScore;
  if (!Number.isFinite(minimumScore) || minimumScore < 0 || minimumScore > 100) return ['metadata.minimumScore inválido'];
  for (const field of ['processo', 'version', 'publishedAt']) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim()) errors.push(`metadata.${field} ausente ou inválido`);
  }
  const cpfs = new Set();
  const registrations = new Set();
  dataset.candidates.forEach((candidate, index) => {
    errors.push(...validateCandidate(candidate, index, minimumScore));
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return;
    if (typeof candidate.cpf === 'string') {
      if (cpfs.has(candidate.cpf)) errors.push(`registro ${index + 1}: CPF duplicado: ${candidate.cpf}`);
      cpfs.add(candidate.cpf);
    }
    if (typeof candidate.registration === 'string') {
      const registration = candidate.registration.trim();
      if (registrations.has(registration)) errors.push(`registro ${index + 1}: inscrição duplicada: ${registration}`);
      registrations.add(registration);
    }
  });
  return errors;
}

if (require.main === module) {
  try {
    const file = process.argv[2] || 'data/candidatos.json';
    const dataset = JSON.parse(fs.readFileSync(file, 'utf8'));
    const errors = validateDataset(dataset);
    if (errors.length) {
      console.error('VALIDAÇÃO REPROVADA');
      errors.forEach(error => console.error(` - ${error}`));
      process.exitCode = 1;
    } else {
      console.log(`VALIDAÇÃO APROVADA: ${dataset.candidates.length} candidatos`);
    }
  } catch (error) {
    console.error(`VALIDAÇÃO REPROVADA: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { validateCandidate, validateDataset };
