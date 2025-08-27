"use client";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Button () {
    const [refresh, setRefresh] = useState(false);

    const handleRefresh = () => { 
        console.log("Refresh clicked");
        setRefresh(true);
        setTimeout(() => {
            setRefresh(false);
        }, 1000)
    }
    
    return (
        <button onClick={handleRefresh} className={`py-2 px-4 rounded-lg text-blue-500 text-sm border border-blue-600 flex justify-center items-center space-x-2 cursor-pointer hover:bg-blue-600/20 transition ease-in-out duration-200  ${refresh ? "bg-blue-600/20" : ""}`}><p>Refresh</p> <RefreshCw size={16} className={`${refresh ? "animate-spin text-emerald-300" : ""}`} /></button>
    );
}