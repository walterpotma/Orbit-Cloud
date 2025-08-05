"use client"
import { Database, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Page() {
    const imagensDocker = [
        { id: 1, name: "nginx", tag: "1.25", size: "23MB", created: "2h ago", status: 1 },
        { id: 2, name: "node", tag: "18-alpine", size: "45MB", created: "1h ago", status: 1 },
        { id: 3, name: "postgres", tag: "15", size: "110MB", created: "30m ago", status: 1 },
        //{ id: 4, name: "redis", tag: "7", size: "32MB", created: "10m ago", status: 2 },
        //{ id: 5, name: "mongo", tag: "6", size: "130MB", created: "20m ago", status: 1 },
        //{ id: 6, name: "python", tag: "3.11-slim", size: "55MB", created: "1h ago", status: 1 },
        //{ id: 7, name: "dotnet", tag: "8.0-sdk", size: "190MB", created: "3h ago", status: 2 },
        //{ id: 8, name: "golang", tag: "1.21", size: "82MB", created: "5h ago", status: 1 },
        //{ id: 9, name: "ubuntu", tag: "22.04", size: "29MB", created: "4h ago", status: 2 },
        //{ id: 10, name: "alpine", tag: "latest", size: "5MB", created: "6h ago", status: 1 },
        //{ id: 11, name: "mysql", tag: "8", size: "140MB", created: "8h ago", status: 1 },
        //{ id: 12, name: "traefik", tag: "v2.10", size: "68MB", created: "7h ago", status: 1 },
        //{ id: 13, name: "httpd", tag: "2.4", size: "53MB", created: "2h ago", status: 2 },
        //{ id: 14, name: "busybox", tag: "latest", size: "1MB", created: "9h ago", status: 1 },
        //{ id: 15, name: "nextcloud", tag: "27", size: "780MB", created: "15m ago", status: 1 }
    ];

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Deploy</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button className="py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200"><p>Refresh</p> <RefreshCcw size={16} /></button>
                    </div>
                </div>
                <div className="w-full my-4 flex justify-between space-x-4">
                    <div className="w-1/2 p-6 rounded-xl bg-slate-900">
                        <h1 className="text-xl mb-6">Imagens</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            {imagensDocker.map((img, index) => (
                                <div key={index} className="w-full p-4 rounded-lg bg-slate-800">
                                    {img.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 p-6 rounded-xl bg-slate-900">
                        <h1 className="text-xl mb-6">Deploys</h1>
                        <div className="w-full space-y-4">
                            {imagensDocker.map((img, index) => (
                                <div key={index} className="w-full p-4 rounded-lg bg-slate-800">
                                    {img.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full px-6 py-6 pt-4 rounded-2xl bg-slate-900">
                    <div className="w-full mb-4 flex justify-between items-center">
                        <h1 className="text-xl">Logs do Deploy</h1>
                        <span className="text-slate-500 flex space-x-1 cursor-pointer hover:text-slate-400">
                            <i className="bi bi-trash-fill mb-4"></i>
                            <p>limpar</p>
                        </span>
                    </div>
                    <div className="w-full h-96 p-4 rounded-xl bg-slate-950 text-slate-600">
                        <p>// saida de comando</p>
                    </div>
                </div>
            </div>
        </div>
    );
}