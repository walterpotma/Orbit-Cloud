"use client";

export default function Card({ title, value, icon: Icon, color, sub }: any) {
    return (
        <div className="relative overflow-hidden bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={64} />
            </div>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-zinc-950 border border-zinc-800 ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-zinc-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-zinc-100">{value}</h3>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <span className="text-xs text-zinc-500 font-mono">{sub}</span>
            </div>
        </div>
    );
} 