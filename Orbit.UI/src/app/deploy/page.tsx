"use client"
import { Database, GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import NewDeploy from "@/components/deploy/new-deploy";
import EditDeploy from "@/components/deploy/edit-deploy";
import BtnRefresh from "@/components/ui/BtnRefresh";
import SearchBar from "@/components/ui/table/search";

export default function Page() {
    const [currentPageImage, setCurrentPageImage] = useState(1);
    const [currentPageDeploy, setCurrentPageDeploy] = useState(1);
    const itemsPerPageImage = 6;
    const itemsPerPageDeploy = 9;

    const [filter, setFilter] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const filterOptions = ["Todos", "Ativos", "Inativos"];

    const [newDeploy, setNewDeploy] = useState(false);
    const [editDeploy, setEditDeploy] = useState(false);

    const imagensDocker = [
        { id: 1, name: "nginx", tag: "1.25", size: "23MB", created: "2h ago", status: 1 },
        { id: 2, name: "node", tag: "18-alpine", size: "45MB", created: "1h ago", status: 1 },
        { id: 3, name: "postgres", tag: "15", size: "110MB", created: "30m ago", status: 1 },
        { id: 4, name: "redis", tag: "7", size: "32MB", created: "10m ago", status: 2 },
        { id: 5, name: "mongo", tag: "6", size: "130MB", created: "20m ago", status: 1 },
        { id: 6, name: "python", tag: "3.11-slim", size: "55MB", created: "1h ago", status: 1 },
        { id: 7, name: "dotnet", tag: "8.0-sdk", size: "190MB", created: "3h ago", status: 2 },
        { id: 8, name: "golang", tag: "1.21", size: "82MB", created: "5h ago", status: 1 },
        { id: 9, name: "ubuntu", tag: "22.04", size: "29MB", created: "4h ago", status: 2 },
        { id: 10, name: "alpine", tag: "latest", size: "5MB", created: "6h ago", status: 1 },
        { id: 11, name: "mysql", tag: "8", size: "140MB", created: "8h ago", status: 1 },
        { id: 12, name: "traefik", tag: "v2.10", size: "68MB", created: "7h ago", status: 1 },
        { id: 13, name: "httpd", tag: "2.4", size: "53MB", created: "2h ago", status: 2 },
        { id: 14, name: "busybox", tag: "latest", size: "1MB", created: "9h ago", status: 1 },
        { id: 15, name: "nextcloud", tag: "27", size: "780MB", created: "15m ago", status: 1 }
    ];
    const deploys = [
        { id: 1, name: "nginx", tag: "1.25", status: 1, url: "https://nginx.example.com", created: "2021-08-06T13:00:00Z", branch: "main", repository: "nginx" },
        { id: 2, name: "node", tag: "18-alpine", status: 1, url: "https://node.example.com", created: "2022-08-06T13:00:00Z", branch: "develop", repository: "node" },
        { id: 3, name: "postgres", tag: "15", status: 1, url: "https://postgres.example.com", created: "2022-08-06T13:00:00Z", branch: "release", repository: "postgres" },
        { id: 4, name: "redis", tag: "7", status: 2, url: "https://redis.example.com", created: "2023-08-06T13:00:00Z", branch: "stable", repository: "redis" },
        { id: 5, name: "mongo", tag: "6", status: 1, url: "https://mongo.example.com", created: "2024-08-06T13:00:00Z", branch: "main", repository: "mongo" },
        { id: 6, name: "python", tag: "3.11-slim", status: 1, url: "https://python.example.com", created: "2025-08-06T13:00:00Z", branch: "dev", repository: "python" },
        { id: 7, name: "dotnet", tag: "8.0-sdk", status: 2, url: "https://dotnet.example.com", created: "2025-01-06T13:00:00Z", branch: "feature/api", repository: "dotnet" },
        { id: 8, name: "golang", tag: "1.21", status: 1, url: "https://golang.example.com", created: "2025-02-06T13:00:00Z", branch: "go-mod", repository: "golang" },
        { id: 9, name: "ubuntu", tag: "22.04", status: 2, url: "https://ubuntu.example.com", created: "2025-03-06T13:00:00Z", branch: "lts", repository: "ubuntu" },
        { id: 10, name: "alpine", tag: "latest", status: 1, url: "https://alpine.example.com", created: "2025-05-06T13:00:00Z", branch: "edge", repository: "alpine" },
        { id: 11, name: "mysql", tag: "8", status: 1, url: "https://mysql.example.com", created: "2025-08-06T13:00:00Z", branch: "production", repository: "mysql" },
        { id: 12, name: "traefik", tag: "v2.10", status: 1, url: "https://traefik.example.com", created: "2025-07-06T13:00:00Z", branch: "routing", repository: "traefik" },
        { id: 13, name: "httpd", tag: "2.4", status: 2, url: "https://httpd.example.com", created: "2025-06-06T13:00:00Z", branch: "apache", repository: "httpd" },
        { id: 14, name: "busybox", tag: "latest", status: 1, url: "https://busybox.example.com", created: "2025-08-06T13:00:00Z", branch: "minimal", repository: "busybox" },
        { id: 15, name: "nextcloud", tag: "27", status: 1, url: "https://nextcloud.example.com", created: "2025-04-06T13:00:00Z", branch: "cloud", repository: "nextcloud" }
    ];


    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const intervals: Record<string, number> = {
            ano: 31536000,
            mês: 2592000,
            dia: 86400,
            hora: 3600,
            minuto: 60,
            segundo: 1,
        };

        for (const key of Object.keys(intervals)) {
            const interval = Math.floor(seconds / intervals[key]);
            if (interval >= 1) {
                return `há ${interval} ${key}${interval > 1 ? 's' : ''}`;
            }
        }

        return "agora mesmo";
    };

    const filteredDeploy = deploys.filter((deploy) => {
        const matchesStatus = filter === 0 || deploy.status === filter;
        const matchesSearch = deploy.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPagesDeploy = Math.ceil(filteredDeploy.length / itemsPerPageDeploy);
    const startIndexDeploy = (currentPageDeploy - 1) * itemsPerPageDeploy;
    const paginatedDeploy = filteredDeploy.slice(startIndexDeploy, startIndexDeploy + itemsPerPageDeploy);

    useEffect(() => {
        setCurrentPageDeploy(1);
    }, [filter, searchTerm]);
    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Deploys</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <BtnRefresh />
                    </div>
                </div>
                <div className="w-full my-4 flex flex-col justify-between space-x-4">
                    <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} filter={{ options: filterOptions, activeFilter: filter, onFilterChange: setFilter }} />
                    <div className="w-full p-6 rounded-xl bg-slate-900">
                        <h1 className="text-xl mb-6">Deploys</h1>
                        <div className="w-full grid grid-cols-3 gap-3 space-y-2 justify-start items-start">
                            {paginatedDeploy.map((deploy, index) => (
                                <div key={index} className="w-full p-4 rounded-lg bg-slate-800 flex flex-col justify-between items-start space-y-3.5">
                                    <div className="w-full flex justify-between items-center space-x-2">
                                        <div className="flex justify-center items-center space-x-2">
                                            <i className="devicon-javascript-plain p-2 rounded-full bg-blue-600 text-white text-xl"></i>
                                            <p>{deploy.name}</p>
                                            <p>{deploy.tag}</p>
                                        </div>
                                        <div className="flex justify-center items-center space-x-2">
                                            <span>
                                                {timeAgo(deploy.created)}
                                            </span>
                                            <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-700">
                                                {deploy.status == 1 ? "Ativo" : "Inativo"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full text-sm text-slate-500 flex justify-between items-center space-x-6">
                                        <div className="flex space-x-5">
                                            <span className="flex justify-center items-center space-x-2">
                                                <i className="bi bi-git"></i>
                                                <p>{deploy.repository}</p>
                                            </span>
                                            <span className="flex justify-center items-center space-x-1">
                                                <GitBranch size={16} />
                                                <p>{deploy.branch}</p>
                                            </span>
                                        </div>
                                        <button onClick={() => setEditDeploy(true)} className="px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center space-x-2 cursor-pointer hover:bg-blue-400 transition ease-in-out duration-200">
                                            <i className="bi bi-pencil-fill"></i>
                                            <p>Edit</p>
                                        </button>
                                    </div>
                                    <span className="w-full p-2 rounded-lg bg-slate-900/50 text-slate-600">url: {deploy.url}</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full flex justify-center items-center mt-6 space-x-4">
                            <button
                                onClick={() => setCurrentPageDeploy((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPageDeploy === 1}
                                className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50 cursor-pointer"
                            >
                                Anterior
                            </button>
                            <span className="text-slate-400">Página {currentPageDeploy} de {totalPagesDeploy}</span>
                            <button
                                onClick={() => setCurrentPageDeploy((prev) => Math.min(prev + 1, totalPagesDeploy))}
                                disabled={currentPageDeploy === totalPagesDeploy}
                                className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50 cursor-pointer"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {newDeploy && (
                <NewDeploy onClose={setNewDeploy} />
            )}

            {editDeploy && (
                <div className="w-full absolute top-10 left-0 z-50">
                    <EditDeploy onClose={setEditDeploy} />
                </div>
            )}

        </div>
    );
}