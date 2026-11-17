
const fs = require("fs");
const path = require("path");


const modelo = "Xenova/multilingual-e5-small";


const pastaDocumentos = path.join(__dirname, "documentos");


function dividirEmChunks(texto, tamanho = 500) {
  const palavras = texto.split(/\s+/);
  const chunks = [];
  let trechoAtual = "";

  for (const palavra of palavras) {
    const novoTrecho = trechoAtual
      ? trechoAtual + " " + palavra
      : palavra;

    if (novoTrecho.length > tamanho && trechoAtual) {
      chunks.push(trechoAtual);
      trechoAtual = palavra;
    } else {
      trechoAtual = novoTrecho;
    }
  }

  if (trechoAtual) {
    chunks.push(trechoAtual);
  }

  return chunks;
}


async function main() {
  
  const { pipeline } = await import("@huggingface/transformers");

  console.log("Carregando modelo de embeddings...");

  const extrator = await pipeline(
    "feature-extraction",
    modelo
  );

  const arquivos = fs.readdirSync(pastaDocumentos)
    .filter(arquivo => arquivo.endsWith(".txt"));

  for (const arquivo of arquivos) {
    const caminho = path.join(pastaDocumentos, arquivo);
    const conteudo = fs.readFileSync(caminho, "utf-8");
    const chunks = dividirEmChunks(conteudo);

    console.log(`\nDocumento: ${arquivo}`);

    for (let i = 0; i < chunks.length; i++) {
      
      const resultado = await extrator(
        "passage: " + chunks[i],
        { pooling: "mean", normalize: true }
      );

      const embedding = Array.from(resultado.data);

      console.log(
        `Chunk ${i + 1}: embedding com ${embedding.length} números`
      );
    }
  }

  console.log("\nEmbeddings gerados com sucesso!");
}

main().catch(console.error);
