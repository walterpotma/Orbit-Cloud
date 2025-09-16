
export type FileNode = {
    type: 'file';
    status?: number;
    name: string;
    size: number;
    branch?: string;
    language?: string;
};

export type FolderNode = {
    type: 'folder' | 'deploy' | 'volume';
    status?: number;
    name: string;
    branch?: string;
    language?: string;
    size: number;
    contents: FileSystemNode[];
};

export type FileSystemNode = FileNode | FolderNode;

const fileTree: FileSystemNode[] = [
    {
        type: 'deploy',
        status: 1,
        name: 'api-flask',
        branch: 'main',
        language: 'python',
        size: 30,
        contents: [
            { type: 'file', name: 'app.py', size: 15 },
            { type: 'file', name: 'requirements.txt', size: 5 },
            {
                type: 'volume',
                name: 'src',
                size: 10,
                contents: [
                    { type: 'file', name: 'main.py', size: 8 },
                ]
            }
        ]
    },
    {
        type: 'folder',
        status: 0,
        name: 'documentos',
        branch: 'main',
        size: 50,
        contents: [
            { type: 'file', name: 'relatorio.docx', size: 50 }
        ]
    },
    { type: 'file', name: 'README.md', size: 2 },
    { type: 'file', name: 'index.html', size: 2 },
    {
        type: 'deploy',
        status: 1,
        name: 'Batata',
        language: 'html',
        branch: 'frita',
        size: 50,
        contents: [
            { type: 'file', name: 'relatorio.docx', size: 50 }
        ]
    },
    {
        type: 'folder',
        status: 1,
        name: 'Teste',
        language: 'css',
        branch: 'default',
        size: 50,
        contents: [
            { type: 'file', name: 'style.css', size: 50 }
        ]
    },
    {
        type: 'folder',
        status: 1,
        name: 'Teste',
        language: 'csharp',
        branch: 'default',
        size: 50,
        contents: [
            { type: 'file', name: 'style.css', size: 50 }
        ]
    }
];

export default fileTree;