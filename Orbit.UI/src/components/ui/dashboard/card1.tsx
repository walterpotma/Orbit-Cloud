"use client";

type CardProps = {
    title: string;
    value: number;
    analysis: string;
    className?: string;
}

export default function Card({ title, value, analysis, className }: CardProps) {
    // 🎨 Lógica de Cores Inteligente
    // Detecta palavras-chave para definir a cor do tema (Verde, Vermelho, Amarelo ou Azul)
    const getTheme = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('sucedido') || lower.includes('sucesso')) return {
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "group-hover:border-emerald-500/50",
            glow: "group-hover:shadow-emerald-500/10"
        };
        if (lower.includes('falho') || lower.includes('erro')) return {
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "group-hover:border-rose-500/50",
            glow: "group-hover:shadow-rose-500/10"
        };
        if (lower.includes('pendente') || lower.includes('aguardando')) return {
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "group-hover:border-amber-500/50",
            glow: "group-hover:shadow-amber-500/10"
        };
        // Padrão (Builds, Mensais, etc)
        return {
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/50",
            glow: "group-hover:shadow-blue-500/10"
        };
    };

    const theme = getTheme(analysis);

    return (
        <div className={`group w-full p-6 bg-slate-900/50 border border-slate-800 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.border} ${theme.glow} ${className}`}>
            <div className="flex flex-col justify-between h-full">
                
                {/* Título (Label) */}
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {title}
                    </h1>
                    {/* Bolinha indicadora de status */}
                    <div className={`w-2 h-2 rounded-full ${theme.color.replace('text-', 'bg-')} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                </div>

                {/* Valor Principal (Hero) */}
                <div className="mt-2">
                    <p className="text-4xl font-bold text-white tracking-tight">
                        {value}
                    </p>
                </div>

                {/* Badge de Análise (Footer) */}
                <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-white/5 ${theme.bg} ${theme.color}`}>
                        {analysis}
                    </span>
                </div>
            </div>
        </div>
    );
}