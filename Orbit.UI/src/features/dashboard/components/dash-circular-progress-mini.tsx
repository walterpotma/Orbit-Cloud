"use client";

export default function CircularProgressMini({ percentage, color, icon: Icon, label }: any) {
    // Escalonamento de 1.2x em relação ao anterior:
    // Raio: 14 * 1.2 = 16.8
    // Tamanho do SVG: 40px * 1.2 = 48px (w-12 h-12 no Tailwind)
    const radius = 16.8; 
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-4 p-2.5 bg-zinc-950/30 rounded-lg border border-zinc-800/30 w-fit">
            <div className="relative flex items-center justify-center">
                {/* SVG aumentado para 48x48 (w-12 h-12) */}
                <svg className="transform -rotate-90 w-12 h-12">
                    {/* cx e cy agora são 24 (metade de 48) */}
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-zinc-800" />
                    <circle 
                        cx="24" cy="24" r={radius} 
                        stroke="currentColor" strokeWidth="3.5" fill="transparent"
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        className={`${color} transition-all duration-1000 ease-out`} 
                        strokeLinecap="round" 
                    />
                </svg>
                {/* Ícone levemente maior no centro (12 * 1.2 = 14.4 -> 14) */}
                <div className={`absolute ${color}`}>
                    <Icon size={14} />
                </div>
            </div>
            
            <div className="flex flex-col">
                {/* Labels com ajuste sutil de escala */}
                <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider leading-none">{label}</span>
                <span className="text-base font-mono text-zinc-200 leading-tight">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};