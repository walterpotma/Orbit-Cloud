import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';
import { readdir, writeFile } from 'fs/promises';
import { resolve, join } from 'path';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function listarTudoRecursivamente(diretorio: string): Promise<string[]> {
    const todosOsCaminhos: string[] = [];
    try {
        const itens = await readdir(diretorio, { withFileTypes: true });

        const PASTAS_PARA_IGNORAR = ['node_modules', '.git', 'dist', 'build', 'out'];



        for (const item of itens) {
            const caminhoCompleto = join(diretorio, item.name);
            todosOsCaminhos.push(caminhoCompleto);

            if (item.isDirectory()) {
                if (PASTAS_PARA_IGNORAR.includes(item.name)) {
                    continue;
                }
                const subItens = await listarTudoRecursivamente(caminhoCompleto);
                todosOsCaminhos.push(...subItens);
            }
        }
    } catch (error) {
        console.error(`Não foi possível ler o diretório ${diretorio}. Erro:`, error);
    }
    return todosOsCaminhos;
}

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("A variável de ambiente GOOGLE_API_KEY não foi definida.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/', (req: Request, res: Response) => {
    res.send('API de IA está funcionando!');
});

app.post('/ask', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
        }


        const pastaParaAnalisar = 'C:/Users/walte/Documents/GitHub/Orbit-Cloud/services/Request.IA';
        const caminhoDoDockerfile = join(pastaParaAnalisar, 'Dockerfile');
        const LIMITE_DE_ARQUIVOS = 50; // Defina um limite razoável

        const listaDeArquivos = await listarTudoRecursivamente(pastaParaAnalisar);

        if (listaDeArquivos.length > LIMITE_DE_ARQUIVOS) {
            return res.status(400).json({
                error: `O número de arquivos (${listaDeArquivos.length}) excede o limite de ${LIMITE_DE_ARQUIVOS}. Por favor, especifique uma pasta menor.`
            });
        }

        const stringDaListaDeArquivos = listaDeArquivos.join('\n');

        const promptFinal = `
        **Contexto Fornecido:**
        Abaixo está a estrutura completa de arquivos de um projeto:
        ---
        ${stringDaListaDeArquivos}
        ---

        **Pergunta do Usuário:**
        Com base na estrutura de arquivos acima, ...por favor gere uma dockerfile. **Sua resposta deve ser o conteúdo bruto e puro do arquivo, sem formatação Markdown como \`\`\`. A resposta deve começar diretamente com a linha 'FROM ...' e nada mais.** Será consumido por uma API. Não é necessária nenhuma explicação."
        `;

        console.log(`\n--- Enviando prompt combinado para a IA ---\n`);

        const result = await model.generateContent(promptFinal);
        const response = result.response;
        const text = response.text();
        await writeFile(caminhoDoDockerfile, text);
        console.log(`Dockerfile salvo com sucesso em: ${caminhoDoDockerfile}`);

        console.log(`Resposta da IA: "${text}"`);

        res.status(200).json({
            response: text,
            message: `Dockerfile salvo em ${caminhoDoDockerfile}` // Mensagem de sucesso extra
        });

    } catch (error) {
        console.error("Erro ao processar a requisição:", error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});