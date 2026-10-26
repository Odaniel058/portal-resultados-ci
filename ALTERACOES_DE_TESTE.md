# Alterações de teste

A primeira execução válida no Jenkins foi o Build #1, versão 1.0.0,
commit a06b465d696820d4614c139c7c64d0a0481c788a. Os hashes dos artefatos
baixados foram conferidos com o manifesto.
Para cada falha, registrar commit, número do Build, estágio, mensagem do Console,
diagnóstico e evidência antes de corrigir.

## Falha A: CPF duplicado

- Commit que introduziu a falha: `3d2fb3c` (`test: introduz CPF duplicado`).
- Execução observada: Build #2, FAILURE.
- Estágio: `3. Validar dados`.
- Mensagem: `registro 5: CPF duplicado: 11122233344`.
- Causa: o quinto registro em `data/candidatos.json` repete o CPF do primeiro.
- Regra violada: CPF único por candidato no lote.
- Impacto: a publicação poderia apresentar duas inscrições associadas ao mesmo CPF.
- Evidência: prints enviados pelo operador mostram o histórico e a mensagem do console.
- Os testes e a sincronização foram ignorados por falha anterior; não há nova publicação.
- Benefício do bloqueio: impedir a geração e o arquivamento de uma lista inconsistente.
- Correção: restaurar `55566677788` no quinto registro, sem alterar as regras do validador.
- Recuperação observada: Build #3 terminou com SUCCESS e arquivou artefatos,
  conforme print do Console enviado pelo operador. Commit de correção: `6be95d4`.
- Ainda falta conferir o hash no Console ou manifesto do Build #3 para completar
  a evidência de rastreabilidade dessa recuperação.

## Falha B: versões divergentes

- Commit que introduziu a falha: `d4e08a0` (`test: altera apenas version.txt`).
- Execução observada: Build #4 bloqueado em `5. Sincronizar versões`.
- Evidência: print do Console mostra 15 testes aprovados, version.txt em 1.1.0
  e package.json, data/candidatos.json e public/index.html em 1.0.0.
- Mensagem: `SINCRONIZAÇÃO REPROVADA: Todos os artefatos devem declarar a mesma versão.`
- A geração da publicação e o Quality Gate foram ignorados por falha anterior.
- Causa: somente a versão oficial foi alterada; dados, pacote e página ficaram antigos.
- Impacto: não seria possível identificar uma versão única e coerente da release.
- Correção: sincronizar as quatro fontes em 1.1.0, inclusive o texto visível no HTML.
- Recuperação no Jenkins: pendente da próxima execução e da conferência do manifesto.

## Concorrência: execução anterior abortada

Pendente de execução.
