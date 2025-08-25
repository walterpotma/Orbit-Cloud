"use client";

import { RefreshCcw } from "lucide-react";

export default function Button () {
    const handleRefresh = () => { 
        console.log("Refresh clicked");
    }

    return (
        <button onClick={handleRefresh} className="py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200"><p>Refresh</p> <RefreshCcw size={16} /></button>
    );
}