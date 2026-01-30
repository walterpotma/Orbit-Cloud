"use client"
import { useState, useMemo } from "react";
import 'devicon/devicon.min.css';
import { 
  FolderPlus, 
  FilePlus, 
  HardDrive, 
  Search as SearchIcon,
  Filter
} from "lucide-react";
import BtnRefresh from "@/components/ui/button-refresh";
import FileSystemItem from "@/features/storage/components/storage-view";
import fileTree, { FileSystemNode } from "@/features/storage/types/storage";
import Search from "@/components/ui/search";

// Função de filtro mantida (lógica original)
function filterTree(nodes: FileSystemNode[], searchTerm: string): FileSystemNode[] {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return nodes;

    return nodes.reduce((acc: any, node: any) => {
        const isNodeMatch = node.name.toLowerCase().includes(searchLower);
        if (node.type === 'folder' || node.type === 'deploy' || node.type === 'volume') {
            const filteredContents = filterTree(node.contents, searchTerm);
            if (isNodeMatch || filteredContents.length > 0) {
                const shouldExpand = !isNodeMatch && filteredContents.length > 0;
                acc.push({ 
                    ...node, 
                    contents: isNodeMatch ? node.contents : filteredContents,
                    isInitiallyExpanded: shouldExpand
                 });
            }
        } else if (node.type === 'file' && isNodeMatch) {
            acc.push(node);
        }
        return acc;
    }, []);
}

export default function StoragePage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = useMemo(() => {
        return filterTree(fileTree, searchTerm);
    }, [searchTerm]);

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 p-6 md:p-8 overflow-hidden">
            
            {/* Header Principal */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <HardDrive className="text-purple-500" size={32} />
                        <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Armazenamento
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 ml-11">
                        Gerencie volumes, pastas e arquivos de configuração.
                    </p>
                </div>
                <div>
                    <BtnRefresh />
                </div>
            </div>

            {/* Barra de Ferramentas */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Área de Busca */}
                <div className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors">
                        <SearchIcon size={18} />
                    </div>
                    {/* Wrapper para o componente Search existente, estilizando-o por fora se necessário, 
                        ou assumindo que ele aceita className */}
                    <div className="[&>input]:pl-10 [&>input]:bg-zinc-900 [&>input]:border-zinc-800 [&>input]:text-zinc-200 [&>input]:w-full [&>input]:h-10 [&>input]:rounded-lg [&>input]:focus:ring-2 [&>input]:focus:ring-purple-500/20 [&>input]:transition-all">
                        <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg transition-all text-sm font-medium">
                        <FolderPlus size={16} className="text-blue-400" />
                        Nova Pasta
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg transition-all text-sm font-medium">
                        <FilePlus size={16} className="text-emerald-400" />
                        Novo Arquivo
                    </button>
                </div>
            </div>

            {/* Área Principal (File Tree) */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-inner shadow-black/20">
                
                {/* Header da Tabela */}
                <div className="px-6 py-3 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <Filter size={12} />
                        Estrutura de Arquivos
                    </div>
                    <div className="text-xs text-zinc-600 font-mono">
                        {filtered.length} itens na raiz
                    </div>
                </div>

                {/* Lista Scrollável */}
                <div className="flex-1 overflow-y-auto custom-scroll p-4">
                    {filtered.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {filtered.map((node, index) => (
                                <FileSystemItem key={`${node.name}-${index}`} node={node} />
                            ))}
                        </div>
                    ) : (
                        // Estado Vazio (Busca sem resultados)
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3 pb-20 opacity-60">
                            <SearchIcon size={48} strokeWidth={1} />
                            <p className="text-sm">Nenhum arquivo encontrado para "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                {/* Footer/Status Bar (Opcional, dá um toque profissional) */}
                <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono flex gap-4">
                    <span>Volume: /mnt/orbit-data</span>
                    <span>Read-Write</span>
                    <span className="ml-auto">Orbit FS v2.0</span>
                </div>
            </div>
        </div>
    );
}