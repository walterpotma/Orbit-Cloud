import { readdir, writeFile, readFile } from 'fs/promises';
import { resolve, join } from 'path';

const PASTAS_PARA_IGNORAR = ['node_modules', '.git', 'dist', 'build', 'out'];

export async function listarTudoRecursivamente(diretorio: string): Promise<string[]> {
    const todosOsCaminhos: string[] = [];
    try {
        const itens = await readdir(diretorio, { withFileTypes: true });
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
        throw new Error('Falha ao listar arquivos.');
    }
    return todosOsCaminhos;
}