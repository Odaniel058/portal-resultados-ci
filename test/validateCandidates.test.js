const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { validateDataset } = require('../src/validateCandidates');

function validDataset() {
  return {
    metadata: { processo: 'Seleção de teste', version: '1.0.0', publishedAt: '2026-10-19T12:00:00Z', minimumScore: 60 },
    candidates: [
      { registration: 'MAT-1001', cpf: '11122233344', name: 'Ana', score: 82, status: 'APROVADO' },
      { registration: 'MAT-1002', cpf: '22233344455', name: 'Bruno', score: 47, status: 'LISTA_ESPERA' }
    ]
  };
}

test('aceita lote consistente', () => assert.deepEqual(validateDataset(validDataset()), []));

test('rejeita CPF duplicado', () => {
  const data = validDataset();
  data.candidates[1].cpf = data.candidates[0].cpf;
  assert.match(validateDataset(data).join('\n'), /registro 2: CPF duplicado/);
});

test('rejeita inscrição duplicada', () => {
  const data = validDataset();
  data.candidates[1].registration = data.candidates[0].registration;
  assert.match(validateDataset(data).join('\n'), /inscrição duplicada/);
});

for (const score of [-1, 101, '82', null, NaN]) {
  test(`rejeita nota inválida: ${String(score)}`, () => {
    const data = validDataset();
    data.candidates[0].score = score;
    assert.match(validateDataset(data).join('\n'), /nota fora do intervalo/);
  });
}

test('inclui nota mínima na aprovação e aceita limites 0 e 100', () => {
  for (const [score, status] of [[0, 'LISTA_ESPERA'], [59, 'LISTA_ESPERA'], [60, 'APROVADO'], [100, 'APROVADO']]) {
    const data = validDataset();
    Object.assign(data.candidates[0], { score, status });
    assert.deepEqual(validateDataset(data), []);
  }
});

test('rejeita status incompatível com a nota', () => {
  const data = validDataset();
  data.candidates[0].status = 'LISTA_ESPERA';
  assert.match(validateDataset(data).join('\n'), /esperado APROVADO/);
  data.candidates[0].status = 'APROVADO';
  data.candidates[1].status = 'APROVADO';
  assert.match(validateDataset(data).join('\n'), /esperado LISTA_ESPERA/);
});

test('rejeita campos obrigatórios ausentes', () => {
  for (const field of ['registration', 'cpf', 'name', 'score', 'status']) {
    const data = validDataset();
    delete data.candidates[0][field];
    assert.match(validateDataset(data).join('\n'), new RegExp(`campo obrigatório ausente: ${field}`));
  }
});

test('rejeita CPF com formato inválido ou tipo numérico', () => {
  for (const cpf of ['123', '111.222.333-44', 'abcdefghijk', 11122233344]) {
    const data = validDataset();
    data.candidates[0].cpf = cpf;
    assert.match(validateDataset(data).join('\n'), /CPF deve conter exatamente 11 dígitos/);
  }
});

test('rejeita lote, metadados e registros malformados sem lançar exceção', () => {
  for (const data of [null, [], {}, { metadata: {} }, { metadata: {}, candidates: [] }]) {
    assert.ok(validateDataset(data).length > 0);
  }
  for (const candidate of [null, [], 'inválido']) {
    const data = validDataset();
    data.candidates[0] = candidate;
    assert.match(validateDataset(data).join('\n'), /candidato deve ser um objeto/);
  }
});

test('rejeita nota mínima inválida', () => {
  for (const score of [-1, 101, '60', null]) {
    const data = validDataset();
    data.metadata.minimumScore = score;
    assert.match(validateDataset(data).join('\n'), /minimumScore inválido/);
  }
});

test('linha de comando retorna 0 para lote válido e 1 para erro', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-test-'));
  const script = path.resolve(__dirname, '../src/validateCandidates.js');
  const file = path.join(folder, 'lote.json');
  try {
    const data = validDataset();
    fs.writeFileSync(file, JSON.stringify(data));
    assert.equal(spawnSync(process.execPath, [script, file]).status, 0);
    data.candidates[1].cpf = data.candidates[0].cpf;
    fs.writeFileSync(file, JSON.stringify(data));
    const failure = spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
    assert.equal(failure.status, 1);
    assert.match(failure.stderr, /CPF duplicado/);
    fs.writeFileSync(file, '{');
    assert.equal(spawnSync(process.execPath, [script, file]).status, 1);
    assert.equal(spawnSync(process.execPath, [script, path.join(folder, 'ausente.json')]).status, 1);
  } finally {
    fs.unlinkSync(file);
    fs.rmdirSync(folder);
  }
});
