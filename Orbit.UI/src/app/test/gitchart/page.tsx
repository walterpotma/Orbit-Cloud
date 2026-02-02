"use client";

import { useState, useMemo } from "react";

// --- TIPAGEM ---
type ContributionDay = {
    dateStr: string;
    dateObj: Date;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
};

type MonthData = {
    name: string;
    year: number;
    days: (ContributionDay | null)[]; 
};

// --- HELPER DE DADOS ---
const generateYearData = (): ContributionDay[] => {
    const data: ContributionDay[] = [];
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth() + 1, 1);

    const loopDate = new Date(startDate);
    while (loopDate <= endDate) {
        const chance = Math.random();
        let count = 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        const isWeekend = loopDate.getDay() === 0 || loopDate.getDay() === 6;
        const modifier = isWeekend ? 0.2 : 1;

        if (chance > 0.7) count = Math.floor((Math.random() * 12 + 4) * modifier);
        else if (chance > 0.4) count = Math.floor((Math.random() * 4 + 1) * modifier);

        if (count > 8) level = 4;
        else if (count > 5) level = 3;
        else if (count > 2) level = 2;
        else if (count > 0) level = 1;

        data.push({
            dateStr: loopDate.toISOString().split('T')[0],
            dateObj: new Date(loopDate),
            count,
            level
        });
        loopDate.setDate(loopDate.getDate() + 1);
    }
    return data;
};

export default function MicroCalendarHeatmap() {
    const rawData = useMemo(() => generateYearData(), []);
    const [hoveredDay, setHoveredDay] = useState<{ day: ContributionDay, rect: DOMRect } | null>(null);

    // --- PROCESSAMENTO (Agrupa por Mês) ---
    const monthsData = useMemo(() => {
        const months: MonthData[] = [];
        const dataMap = new Map(rawData.map(d => [d.dateStr, d]));
        if (rawData.length === 0) return [];

        const startDate = rawData[0].dateObj;
        const endDate = rawData[rawData.length - 1].dateObj;
        let currentMonthSetup = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        while (currentMonthSetup <= endDate) {
            const year = currentMonthSetup.getFullYear();
            const monthIndex = currentMonthSetup.getMonth();
            const monthName = currentMonthSetup.toLocaleString('default', { month: 'short' }).replace('.', '');
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            const startDayOfWeek = new Date(year, monthIndex, 1).getDay();
            const monthGrid: (ContributionDay | null)[] = [];

            for (let i = 0; i < startDayOfWeek; i++) monthGrid.push(null);

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                monthGrid.push(dataMap.get(dateStr) || { dateStr, dateObj: new Date(year, monthIndex, day), count: 0, level: 0 });
            }
            months.push({ name: monthName, year, days: monthGrid });
            currentMonthSetup.setMonth(currentMonthSetup.getMonth() + 1);
        }
        return months;
    }, [rawData]);

    // --- ESTILOS DINÂMICOS ---
    
    // Cor do Quadrado
    const getBgColor = (level: number) => {
        switch (level) {
            case 0: return "bg-zinc-800 border-zinc-700/50";
            case 1: return "bg-emerald-900/60 border-emerald-800/50";
            case 2: return "bg-emerald-700/80 border-emerald-600/50";
            case 3: return "bg-emerald-500/90 border-emerald-400/50";
            case 4: return "bg-emerald-300 border-emerald-200/50";
            default: return "bg-zinc-800";
        }
    };

    // Cor do Texto (O segredo da legibilidade)
    const getTextColor = (level: number) => {
        // Níveis baixos (escuros) -> Texto Cinza Claro
        // Níveis altos (claros/brilhantes) -> Texto Verde Escuro (para contraste)
        if (level >= 3) return "text-emerald-950 font-bold";
        if (level === 2) return "text-emerald-100 font-medium";
        if (level === 1) return "text-emerald-200/50 font-normal";
        return "text-zinc-600 font-normal"; // Dia vazio
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 flex justify-center items-start p-8 font-sans overflow-y-auto">
            
            <div className="w-full max-w-7xl">
                 <div className="mb-8">
                    <h2 className="text-xl font-bold text-zinc-100">Atividade Diária</h2>
                    <p className="text-xs text-zinc-500">Visualização detalhada</p>
                </div>

                {/* Grid de Meses */}
                <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center md:justify-start">
                    
                    {monthsData.map((month) => (
                        <div key={month.name + month.year} className="flex flex-col gap-1.5">
                            
                            {/* Cabeçalho do Mês */}
                            <div className="flex justify-between items-end px-0.5">
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                                    {month.name}
                                </span>
                            </div>

                            {/* Dias da Semana (Cabeçalho Pequeno) */}
                            <div className="grid grid-cols-7 gap-[2px] mb-0.5 text-center">
                                {['D','S','T','Q','Q','S','S'].map(d => (
                                    <span key={d} className="text-[8px] text-zinc-600 font-medium">{d}</span>
                                ))}
                            </div>

                            {/* Grid de Dias */}
                            <div className="grid grid-cols-7 gap-[2px]"> 
                                
                                {month.days.map((day, index) => {
                                    // Espaço vazio (offset do mês)
                                    if (!day) return <div key={`empty-${index}`} className="w-4 h-4"></div>;

                                    return (
                                        <div 
                                            key={day.dateStr}
                                            // w-4 h-4 (16px) -> Tamanho mínimo para caber um número legível
                                            className={`
                                                w-4 h-4 rounded-[3px] border 
                                                flex items-center justify-center
                                                transition-all duration-100 
                                                hover:scale-125 hover:z-20 hover:border-zinc-200 hover:shadow-lg
                                                cursor-default select-none
                                                ${getBgColor(day.level)}
                                            `}
                                            onMouseEnter={(e) => setHoveredDay({ day, rect: e.currentTarget.getBoundingClientRect() })}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        >
                                            {/* O NÚMERO DO DIA */}
                                            {/* text-[9px] e leading-none centralizam perfeitamente */}
                                            <span className={`text-[9px] leading-none ${getTextColor(day.level)}`}>
                                                {day.dateObj.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                 {/* Tooltip */}
                 {hoveredDay && (
                        <div 
                            className="fixed bg-zinc-900 border border-zinc-700 p-2 rounded-md shadow-2xl z-50 pointer-events-none transition-all w-max flex flex-col items-center"
                            style={{ 
                                left: hoveredDay.rect.left + (hoveredDay.rect.width / 2), 
                                top: hoveredDay.rect.top - 6,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            <span className="text-zinc-400 text-[10px] font-bold uppercase mb-0.5">
                                {hoveredDay.day.dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-emerald-400 text-xs font-bold">
                                    {hoveredDay.day.count} contribuições
                                </span>
                            </div>
                            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 rotate-45"></div>
                        </div>
                    )}
            </div>
        </div>
    );
}