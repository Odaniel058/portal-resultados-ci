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
- Verificação da recuperação no Jenkins: pendente do próximo Build; conferir novo hash
  no Console, SUCCESS, relatório e manifesto antes de declarar recuperação.

## Falha B: versões divergentes

Pendente de execução.

## Concorrência: execução anterior abortada

Pendente de execução.
