"use client";

type CardProps = {
    title: string;
    subTittle?: string;
    metrics: number[];
    className?: string;
}

export default function Card({ title, metrics, subTittle, className }: CardProps) {
    // Pegamos o primeiro valor para mostrar a % no cabeçalho (assumindo 1 métrica por card)
    const currentPercent = metrics[0] || 0;
    
    // Define a cor baseada na intensidade (Verde -> Amarelo -> Vermelho)
    const getStatusColor = (percent: number) => {
        if (percent > 85) return "from-red-500 to-orange-500 shadow-red-500/20";
        if (percent > 60) return "from-yellow-400 to-orange-500 shadow-yellow-500/20";
        return "from-blue-600 to-cyan-400 shadow-blue-500/20"; // Padrão Orbit
    };

    return (
        <div className={`w-full p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors ${className}`}>
            
            {/* CABEÇALHO: Título + Porcentagem */}
            <div className="w-full flex justify-between items-end mb-3">
                <div className="flex flex-col">
                    <h1 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h1>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{currentPercent.toFixed(0)}%</span>
                    <span className="text-xs text-slate-500">usado</span>
                </div>
            </div>

            {/* BARRA DE PROGRESSO */}
            {metrics.map((value, index) => (
                <div key={index} className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                    {/* Fundo sutil para dar profundidade */}
                    <div className="absolute inset-0 bg-slate-800/50"></div>
                    
                    {/* A Barra com Gradiente e Sombra (Glow) */}
                    <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getStatusColor(value)} shadow-lg transition-all duration-700 ease-out`} 
                        style={{ width: `${value}%` }}
                    ></div>
                </div>
            ))}

            {/* RODAPÉ: Detalhes Técnicos (ex: 18 MiB / 512 MiB) */}
            <div className="mt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
                    {subTittle}
                </span>
                {/* Indicador visual de saúde */}
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${currentPercent > 85 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <span className="text-slate-400">{currentPercent > 85 ? 'Crítico' : 'Saudável'}</span>
                </div>
            </div>
        </div>
    );
}