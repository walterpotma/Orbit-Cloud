import { cardProps } from "@/features/billing/types/plans";
import { Check } from "lucide-react";

export default function Card(cardProps: cardProps) {
    return (
        <div className="w-3/10 px-10 py-8 bg-slate-900 rounded-xl flex flex-col space-y-1">
            <h1 className="text-center font-bold text-3xl">{cardProps.name}</h1>
            <p className="text-blue-500 text-2xl font-bold">R$ {cardProps.price}</p>
            <div className="h-full text-slate-500 flex flex-col justify-between">
                <div>
                    <div className="p-2 border-b border-slate-800 flex space-x-1 items-center">
                        <Check className="text-cyan-800"/>
                        <p className="font-bold text-slate-400">{cardProps.resources[0].ram} GB</p>
                        <p>RAM</p>
                    </div>
                    <div className=" p-2 border-b border-slate-800 flex space-x-1 items-center">
                        <Check className="text-cyan-800"/>
                        <p className="font-bold text-slate-400">{cardProps.resources[0].cpu} vCPU</p>
                        <p>CPU</p>
                    </div>
                    <div className="p-2 border-b border-slate-800 flex space-x-1 items-center">
                        <Check className="text-cyan-800"/>
                        <p className="font-bold text-slate-400">{cardProps.resources[0].disk} GB</p>
                        <p>RAM</p>
                    </div>
                    <div className="p-2 flex space-x-1 items-center">
                        <p className="text-slate-500">{cardProps.resources[0].description}</p>
                    </div>
                </div>
                <button className="w-full py-3 rounded-lg bg-blue-700 text-white cursor-pointer transition ease-in-out duration-200 hover:bg-blue-500">Selecionar</button>
            </div>
        </div>
    );
}