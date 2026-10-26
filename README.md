# Portal de resultados CI

Caso 1 do laboratório de Jenkins: impedir a publicação de resultados acadêmicos
com dados inválidos ou versões divergentes.

## Estrutura

- `data/`: dados de entrada fictícios.
- `public/`: página pública com versão declarada e visível.
- `src/`: validação e geração do relatório.
- `scripts/`: conferência de versão, manifesto e Quality Gate.
- `test/`: testes automatizados das regras.
- `version.txt`: versão oficial da publicação.
- `package.json`: identificação do projeto e comandos npm.
- `ALTERACOES_DE_TESTE.md`: registro dos diagnósticos e evidências.

## Progresso

Dados, validações, testes, sincronização, relatório, manifesto e Pipeline implementados.
As falhas controladas serão introduzidas após a primeira execução válida no Jenkins.

## Executar localmente

Requer Node.js 22 ou superior e Git. Não usa pacotes externos.

```sh
npm run ci
```

Gera `dist/index.html`, `dist/relatorio.json` e `dist/manifest.json`.
O relatório não inclui CPF. O manifesto registra commit e hashes SHA-256.
Execuções locais usam `buildNumber: local`; não são Builds Jenkins.

## Configurar no Jenkins

O agente Jenkins deve usar Linux com Node.js e Git, conforme o ambiente do roteiro.

1. New Item → Pipeline → nome `portal-resultados-ci`.
2. Definition: Pipeline script from SCM; SCM: Git.
3. Repository URL: `https://github.com/Odaniel058/portal-resultados-ci.git`.
4. Branch: `*/main`; Script Path: `Jenkinsfile`.
5. Save e Build Now. Após carregar os parâmetros, usar Build with Parameters.
6. Baseline com atraso `0`: conferir SUCCESS, hash no Console e três artefatos.

Não executar as falhas antes de guardar as evidências da baseline.
Testes locais não comprovam o funcionamento da Pipeline no Jenkins.
