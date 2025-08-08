"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import CommandOutput from "@/components/deploy/command-output";
import Input2 from "@/components/ui/input2";

export default function Page({ onClose }: { onClose: (value: boolean) => void }) {
    return (
        <div onClick={() => onClose(false)} className="w-full h-screen bg-black/70 flex justify-center items-center absolute inset-0 cursor-pointer">
            <div onClick={(e) => e.stopPropagation()} className="w-4/5 max-h-11/12 p-8 bg-slate-800 rounded-xl overflow-auto custom-scroll cursor-auto">
                <div>
                    <h1 className="text-2xl font-bold mb-4">Edit Deploy</h1>
                </div>
                <div>
                    <form action="" className="w-1/2 my-6 flex flex-col justify-start items-start space-y-2 space-x-2">
                        <div className="w-full flex space-x-2">
                            <select name="" id="" className="w-1/2 py-2 px-4 rounded-lg bg-slate-900 text-sm text-slate-500 cursor-pointer outline-0">
                                <option value="" className="outline-0" selected>Imagem</option>
                                <option value="" className="outline-0">Node</option>
                                <option value="" className="outline-0">Python</option>
                                <option value="" className="outline-0">Next</option>
                                <option value="" className="outline-0">WebApi C#</option>
                                <option value="" className="outline-0">java SpringBot</option>
                            </select>
                            <select name="" id="" className="w-1/2 py-2 px-4 rounded-lg bg-slate-900 text-sm text-slate-500 cursor-pointer outline-0">
                                <option value="" className="outline-0" selected>Imagem</option>
                                <option value="" className="outline-0">Node</option>
                                <option value="" className="outline-0">Python</option>
                                <option value="" className="outline-0">Next</option>
                                <option value="" className="outline-0">WebApi C#</option>
                                <option value="" className="outline-0">java SpringBot</option>
                            </select>
                        </div>
                        <select name="" id="" className="w-full py-2 px-4 rounded-lg bg-slate-900 text-sm text-slate-500 cursor-pointer outline-0">
                            <option value="" className="outline-0" selected>Imagem</option>
                            <option value="" className="outline-0">Node</option>
                            <option value="" className="outline-0">Python</option>
                            <option value="" className="outline-0">Next</option>
                            <option value="" className="outline-0">WebApi C#</option>
                            <option value="" className="outline-0">java SpringBot</option>
                        </select>
                        <div className="w-full flex justify-between items-center space-x-2">
                            <Input2 placeholder="Sub Dominio" className="w-full" />
                            <select name="" id="" className="w-30 py-3 px-4 rounded-lg bg-slate-900 text-sm text-slate-500 cursor-pointer outline-0">
                                <option value="" className="outline-0" selected>Imagem</option>
                                <option value="" className="outline-0">Node</option>
                                <option value="" className="outline-0">Python</option>
                                <option value="" className="outline-0">Next</option>
                                <option value="" className="outline-0">WebApi C#</option>
                                <option value="" className="outline-0">java SpringBot</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div>
                    <CommandOutput />
                </div>
            </div>
        </div>
    );
}