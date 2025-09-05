"use client"
import { Database, GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import BtnRefresh from "@/components/ui/BtnRefresh";
import FileSystemItem from "@/components/storage/file-sistem";

type FileNode = {
    type: 'file';
    name: string;
    size: number;
};

type FolderNode = {
    type: 'folder' | 'deploy' | 'volume';
    name: string;
    size: number;
    contents: FileSystemNode[];
};

type FileSystemNode = FileNode | FolderNode;

const fileTree: FileSystemNode[] = [
    {
        type: 'deploy',
        name: 'api-flask',
        size: 30,
        contents: [
            { type: 'file', name: 'app.py', size: 15 },
            { type: 'file', name: 'requirements.txt', size: 5 },
            {
                type: 'volume',
                name: 'src', // Subpasta
                size: 10,
                contents: [
                    { type: 'file', name: 'main.py', size: 8 },
                ]
            }
        ]
    },
    {
        type: 'folder',
        name: 'documentos',
        size: 50,
        contents: [
            { type: 'file', name: 'relatorio.docx', size: 50 }
        ]
    },
    { type: 'file', name: 'README.md', size: 2 }
];


export default function Page() {
    const [filter, setFilter] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Armazenamento</h1>
                    <div className="flex justify-center items-center space-x-3">
                        {/* <button className="px-4 py-2 rounded-lg border-2 bg-blue-500 border-blue-500 text-sm text-white cursor-pointer hover:bg-blue-400 transition ease-in-out duration-200"> + Add Imagem</button> */}
                        <BtnRefresh />
                    </div>
                </div>
                <div className="w-full flex justify-between items-center my-4">
                </div>

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
                        {fileTree.map((node, index) => (
                            <FileSystemItem key={index} node={node} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}