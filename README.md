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

Estrutura inicial criada. Dados, validações, testes e Pipeline serão acrescentados
em commits separados, seguindo a construção incremental do roteiro.

Nenhum Build Jenkins foi executado nesta etapa.
