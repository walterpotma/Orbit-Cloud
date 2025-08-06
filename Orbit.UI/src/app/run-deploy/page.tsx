"use client"

export default function Page() {
    return (
        <div>
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
    );
}