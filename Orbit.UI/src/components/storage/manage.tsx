"use client";
import { useEffect, useState } from "react";
import { FileSystemNode } from "@/model/storage";

type FileSystemItemProps = {
    node: FileSystemNode & { isInitiallyExpanded?: boolean };
};

export default function FileSystemItem({ node }: { node: FileSystemNode }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (node.isInitiallyExpanded) {
            setIsOpen(true);
        }
    }, [node.isInitiallyExpanded]);

    function getAfterLastDot(text: string): string {
        if (!text) return 'unknown';
        const parts = text.split('.');
        return parts.length > 1 ? parts.pop()! : 'unknown';
    }

    function getIconClass(nodeType: 'folder' | 'deploy' | 'volume', isOpen: boolean): string {
        switch (nodeType) {
            case 'deploy':
                return `bi-rocket-takeoff${isOpen ? "-fill" : ""}`;
            case 'volume':
                return `bi-cloud${isOpen ? "-fill" : ""}`;
            case 'folder':
            default:
                return `bi-folder${isOpen ? "-fill" : ""}`;
        }
    }

    if (node.type === 'folder' || node.type === 'deploy' || node.type === 'volume') {
        return (
            <div className="ml-2">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center p-1 cursor-pointer hover:bg-slate-800 rounded"
                >
                    <i className={`bi ${getIconClass(node.type, isOpen)} mr-2 text-blue-400`}></i>
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