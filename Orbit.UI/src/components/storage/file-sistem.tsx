"use client";
import { useState } from "react";

type FileNode = {
    type: 'file';
    name: string;
    size: number;
};

type FolderNode = {
    type: 'folder';
    name: string;
    size: number;
    contents: FileSystemNode[];
};

type FileSystemNode = FileNode | FolderNode;


export default function FileSystemItem({ node }: { node: FileSystemNode }) {
    const [isOpen, setIsOpen] = useState(false);

    function getAfterLastDot(text: string): string {
        if (!text) return 'unknown';
        const parts = text.split('.');
        return parts.length > 1 ? parts.pop()! : 'unknown';
    }

    if (node.type === 'folder') {
        return (
            <div className="ml-2">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center p-1 cursor-pointer hover:bg-slate-800 rounded"
                >
                    <i className={`bi bi-folder-${isOpen ? "minus" : "plus"} mr-2 text-blue-400`}></i>
                    <span>{node.name}</span>
                </div>
                {isOpen && (
                    <div className="pl-4 border-l border-slate-700">
                        {node.contents.map((childNode, index) => (
                            <FileSystemItem key={index} node={childNode} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center p-1 ml-2">
            <i className={`bi bi-filetype-${getAfterLastDot(node.name)} mr-2 text-slate-400`}></i>
            <span className="text-slate-400">{node.name}</span>
        </div>
    );
}