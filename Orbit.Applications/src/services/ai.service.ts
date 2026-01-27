import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Corrigido o nome do modelo

export async function encontrarArquivoDeVersao(fileList: string): Promise<string> {
    const promptFinal = `
        Contexto: Abaixo está uma lista de caminhos de arquivo de um projeto:
        ---
        ${fileList}
        ---
        Tarefa: Analise a lista e retorne APENAS o caminho do arquivo que provavelmente contém a versão do projeto. Se não encontrar, retorne "latest".
        Regras: Responda apenas com o caminho ou "latest", sem Markdown ou explicações.
    `;
    const result = await model.generateContent(promptFinal);
    return result.response.text().trim();
}

export async function gerarDockerfile(prompt: string, fileList: string, versionInfo: string): Promise<string> {
    const promptFinal = `
        **Contexto Fornecido:**
        Estrutura de arquivos:
        ---
        ${fileList}
        ---
        Conteúdo do arquivo de versão:
        ---
        ${versionInfo}
        ---
        **Pergunta do Usuário:**
        Com base no contexto acima, gere um Dockerfile. ${prompt}
        Garanta que a aplicação vai escutar na porta 8080.
        Sua resposta deve ser o conteúdo bruto e puro do arquivo, sem formatação Markdown.
    `;
    const result = await model.generateContent(promptFinal);
    return result.response.text();
}