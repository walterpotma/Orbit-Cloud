"use client"
import { Database, GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import 'devicon/devicon.min.css';
import BtnRefresh from "@/components/ui/button-refresh";
import FileSystemItem from "@/features/storage/components/storage-view";
import fileTree, { FileSystemNode } from "@/features/storage/types/storage";
import Search from "@/components/ui/table/search";

function filterTree(nodes: FileSystemNode[], searchTerm: string): FileSystemNode[] {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return nodes;

    return nodes.reduce((acc: any, node: any) => {
        const isNodeMatch = node.name.toLowerCase().includes(searchLower);
        if (node.type === 'folder' || node.type === 'deploy' || node.type === 'volume') {
            const filteredContents = filterTree(node.contents, searchTerm);
            if (isNodeMatch || filteredContents.length > 0) {
                const shouldExpand = !isNodeMatch && filteredContents.length > 0;
                acc.push({ ...node, contents: isNodeMatch ? node.contents : filteredContents,
                    isInitiallyExpanded: shouldExpand
                 });
            }
        } else if (node.type === 'file' && isNodeMatch) {
            acc.push(node);
        }
        return acc;
    }, []);
}



export default function Page() {
    const [searchTerm, setSearchTerm] = useState("");

    
    const filtered = useMemo(() => {
        return filterTree(fileTree, searchTerm);
    }, [searchTerm]);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Armazenamento</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <BtnRefresh />
                    </div>
                </div>
                <div className="w-full flex justify-between items-center my-4">
                </div>

                <Search value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>

                <div className="w-full p-6 rounded-2xl bg-slate-900 flex flex-col justify-start items-start overflow-auto custom-scroll space-y-3">
                    <div className="w-full flex justify-between items-center">
                        <span className="flex space-x-2 text-slate-500">
                            <i className="bi bi-folder-fill"></i>
                            <h1 className="">Nome do ficheiro</h1>
                        </span>
                        <div className="flex space-x-2">
                            <button className="py-1 px-2 bg-slate-800 rounded-md text-sm text-slate-600 flex space-x-1 hover:bg-slate-700 hover:text-slate-500 cursor-pointer transition ease-in-out duration-200">
                                <i className="bi bi-folder-plus"></i>
                                <p>Pasta</p>
                            </button>
                            <button className="py-1 px-2 bg-slate-800 rounded-md text-sm text-slate-600 flex space-x-1 hover:bg-slate-700 hover:text-slate-500 cursor-pointer transition ease-in-out duration-200">
                                <i className="bi bi-file-earmark-plus"></i>
                                <p>Arquivo</p>
                            </button>
                        </div>
                    </div>
                    <div className="w-full p-6 rounded-xl bg-slate-950/50">
                        {filtered.map((node, index) => (
                            <FileSystemItem key={index} node={node} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}