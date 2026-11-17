# Mini-RAG com a documentação do Git

## Sobre o projeto

Este projeto em Node.js responde a perguntas em português sobre `git init`, `git add` e `git commit`. Ele busca trechos da documentação oficial do Git e usa o Gemini para responder com base no conteúdo recuperado. [git init](https://git-scm.com/docs/git-init) · [git add](https://git-scm.com/docs/git-add) · [git commit](https://git-scm.com/docs/git-commit)

## Como executar no Windows com VS Code

1. Abra no VS Code a pasta que contém o `package.json`. Use o Node.js 22 ou superior.
2. Abra **Terminal → Novo Terminal** e instale as dependências:

   ```powershell
   npm.cmd ci
   ```

3. Para executar apenas a busca, sem chave de API, rode:

   ```powershell
   npm.cmd run busca
   ```

   Na primeira execução, o programa baixa o modelo de embeddings. A busca salva os resultados em `evidencias-busca.md`.

4. Para gerar respostas, obtenha sua própria chave no [Google AI Studio](https://aistudio.google.com/api-keys) e copie o arquivo de configuração:

   ```powershell
   Copy-Item .env.example .env
   ```

   Abra o `.env`, cole sua chave depois de `GEMINI_API_KEY=` e salve. O modelo padrão é `gemini-3.1-flash-lite` e pode ser alterado em `GEMINI_MODEL`. Mantenha a chave apenas no `.env` local.

5. Para executar as cinco perguntas e gerar o relatório, rode:

   ```powershell
   npm.cmd test
   ```

   O comando grava ou atualiza o `evidencias-gemini.md`. O relatório incluído na entrega pode ser lido sem chave de API.

Para fazer uma pergunta livre, execute:

```powershell
npm.cmd run perguntar -- "O que acontece se eu executar git init em um repositório existente?"
```

## Perguntas de validação

1. Qual comando cria um repositório Git vazio?
2. Se eu editar um arquivo de novo depois de prepará-lo para o próximo registro, como incluo a versão mais recente?
3. Qual é a diferença entre git add e git commit?
4. Como usar git add para incluir um arquivo ignorado pelo Git?
5. Como configurar uma chave SSH no GitHub para enviar commits?

A primeira pergunta tem resposta explícita na documentação. A segunda testa uma paráfrase em português. A quinta trata de uma informação ausente nos três documentos.

## Implementação e conclusão técnica

O programa divide os documentos em trechos de aproximadamente 500 caracteres e gera embeddings com `@huggingface/transformers` e o modelo `Xenova/multilingual-e5-small`. Os vetores ficam em memória. Para cada pergunta, o programa calcula a similaridade de cosseno e envia os três trechos mais próximos à API Gemini. [Modelo de embeddings](https://huggingface.co/Xenova/multilingual-e5-small)

O teste indexou **9 trechos com embeddings de 384 dimensões** e registrou as cinco respostas com o modelo `gemini-3.1-flash-lite`. Na segunda pergunta, o Gemini orientou a executar `git add` novamente. Na quarta, indicou `git add --force` e citou o trecho correspondente. Na quinta, informou que os trechos eram insuficientes para responder sobre SSH.

Na primeira resposta, o Gemini escreveu `git-init`, o nome da página do manual. O comando executável é `git init`, com espaço. Outra limitação é que a busca sempre retorna os trechos mais próximos, mesmo quando a informação pedida está ausente. Um escore alto mede proximidade semântica e, por si só, não garante que o trecho sustente a resposta.

## Arquivos principais

- `index.js`, `rag.js`, `gemini.js` e `perguntas.js` contêm o código.
- `documentos/` contém os três arquivos usados como base de conhecimento.
- `evidencias-busca.md` registra os trechos recuperados na busca local.
- `evidencias-gemini.md` registra as cinco perguntas, os trechos e as respostas da API.
- `.env.example` contém o modelo de configuração com o campo da chave em branco.
