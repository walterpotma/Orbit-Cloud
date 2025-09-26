import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';
import * as fsService from '../services/filesystem.service';
import { join } from 'path';
import { writeFile, readFile } from 'fs/promises';

export async function findVersion(req: Request, res: Response) {
    try {
        const { fileList } = req.body;
        if (!fileList) {
            return res.status(400).json({ error: 'O campo "fileList" é obrigatório.' });
        }

        const versaoEncontrada = await aiService.encontrarArquivoDeVersao(fileList);
        console.log(`Resposta da IA (arquivo de versão): "${versaoEncontrada}"`);

        res.status(200).json({ versionFile: versaoEncontrada });
    } catch (error) {
        console.error("Erro no controlador findVersion:", error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
}

export async function generateDockerfile(req: Request, res: Response) {
    try {
        const { prompt, pasta } = req.body;

        if (!prompt || !pasta) {
            return res.status(400).json({ error: 'Os campos "prompt" e "pasta" são obrigatórios.' });
        }

        const listaDeArquivos = await fsService.listarTudoRecursivamente(pasta);
        const stringDaLista = listaDeArquivos.join('\n');
        
        const versionFileName = await aiService.encontrarArquivoDeVersao(stringDaLista);

        let versionFileContent = 'Nenhum arquivo de versão foi identificado.';
        if (versionFileName && versionFileName !== 'latest') {
            versionFileContent = await readFile(versionFileName, 'utf8');
        }

        const dockerfileContent = await aiService.gerarDockerfile(prompt, stringDaLista, versionFileContent);
        
        const caminhoDoDockerfile = join(pasta, 'Dockerfile');
        await writeFile(caminhoDoDockerfile, dockerfileContent);
        console.log(`Dockerfile salvo com sucesso em: ${caminhoDoDockerfile}`);

        res.status(200).json({
            response: dockerfileContent,
            message: `Dockerfile salvo em ${caminhoDoDockerfile}`
        });

    } catch (error: any) {
        console.error("Erro no controlador generateDockerfile:", error);
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.', details: error.message });
    }
}