"use client";
import { useEffect, useState } from "react";
import { FileSystemNode } from "@/features/storage/types/storage";
import { 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  FileJson, 
  FileImage, 
  FileText, 
  Rocket, 
  Database
} from "lucide-react";

// Mapeamento de ícones por extensão
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <FileCode size={16} className="text-blue-400" />;
    case 'css':
    case 'scss':
      return <FileCode size={16} className="text-pink-400" />;
    case 'json':
    case 'yaml':
    case 'yml':
      return <FileJson size={16} className="text-yellow-400" />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <FileImage size={16} className="text-purple-400" />;
    case 'md':
    case 'txt':
      return <FileText size={16} className="text-slate-400" />;
    default:
      return <File size={16} className="text-slate-500" />;
  }
};

export default function FileSystemItem({ node }: { node: FileSystemNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // CORREÇÃO 1: Acesso seguro ao contents
  // Dizemos ao TS: "Trate isso como algo que PODE ter contents"
  const safeContents = (node as any).contents as FileSystemNode[] | undefined;
  const hasChildren = safeContents && safeContents.length > 0;
  
  const isContainer = ['folder', 'deploy', 'volume'].includes(node.type);

  useEffect(() => {
    if (node.isInitiallyExpanded) {
      setIsOpen(true);
    }
  }, [node.isInitiallyExpanded]);

  const getNodeIcon = () => {
    if (node.type === 'deploy') return <Rocket size={16} className="text-purple-500" />;
    if (node.type === 'volume') return <Database size={16} className="text-emerald-500" />;
    
    if (node.type === 'folder') {
      return isOpen ? 
        <FolderOpen size={16} className="text-blue-400" /> : 
        <Folder size={16} className="text-blue-400" />;
    }
    
    return getFileIcon(node.name);
  };

  return (
    <div className="select-none">
      {/* Linha do Item */}
      <div
        onClick={() => isContainer && setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-200
          ${isContainer ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-800/30 ml-6'}
        `}
      >
        {/* Seta de Expansão */}
        {isContainer && (
          <span className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight size={14} />
          </span>
        )}

        {/* Ícone do Node - CORREÇÃO 2: shrink-0 */}
        <span className="shrink-0">
          {getNodeIcon()}
        </span>

        {/* Nome do Arquivo/Pasta */}
        <span className={`text-sm font-mono truncate ${isOpen && isContainer ? 'text-zinc-200 font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
          {node.name}
        </span>
      </div>

      {/* Renderização Recursiva dos Filhos */}
      {isContainer && isOpen && hasChildren && safeContents && (
        <div className="relative ml-2.5 pl-3 border-l border-zinc-800">
          {/* CORREÇÃO 3: Tipagem explícita no map */}
          {safeContents.map((childNode: FileSystemNode, index: number) => (
            <FileSystemItem key={`${childNode.name}-${index}`} node={childNode} />
          ))}
        </div>
      )}
      
      {/* Estado vazio para pastas */}
      {isContainer && isOpen && !hasChildren && (
        <div className="ml-8 py-1 text-xs text-zinc-600 italic">
          (vazio)
        </div>
      )}
    </div>
  );
}