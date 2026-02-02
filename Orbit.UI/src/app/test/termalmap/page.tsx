"use client";

import { useState, useMemo } from "react";
import { FiWind, FiCpu, FiAlertTriangle } from "react-icons/fi"; // Instalar react-icons

// --- TIPAGEM ---
interface RackUnit {
    id: string;
    row: string;
    col: number;
    tempFront: number; // Temperatura na entrada de ar
    tempRear: number;  // Temperatura na saída de ar (exaustão)
    load: number;      // Carga total do rack (gera calor)
    status: "ok" | "warning" | "critical";
}

// --- GERADOR DE DADOS (Simula 4 fileiras de Racks) ---
const generateFloorPlan = () => {
    const rows = ['A', 'B', 'C', 'D'];
    const cols = 8;
    const racks: RackUnit[] = [];

    rows.forEach((row, rowIndex) => {
        for (let c = 1; c <= cols; c++) {
            // Lógica de simulação:
            // Fileiras B e C formam um "Corredor Quente" no meio.
            // Fileiras A e D recebem ar frio de fora.
            
            const isHotAisleSide = (row === 'B' || row === 'C');
            const baseTemp = isHotAisleSide ? 35 : 22; 
            
            // Adiciona variação aleatória ("Hot Spots")
            const randomHeat = Math.random() * 5;
            const load = Math.floor(Math.random() * 60) + 20; // 20-80% load
            
            // Se a carga for alta, a temperatura de saída sobe muito
            const tempRear = baseTemp + (load * 0.15) + randomHeat;
            const tempFront = 20 + Math.random() * 2; // Ar condicionado mantendo ~20-22C

            let status: "ok" | "warning" | "critical" = "ok";
            if (tempRear > 45) status = "critical";
            else if (tempRear > 38) status = "warning";

            racks.push({
                id: `R-${row}${c}`,
                row,
                col: c,
                tempFront: Math.floor(tempFront),
                tempRear: Math.floor(tempRear),
                load,
                status
            });
        }
    });
    return racks;
};

export default function DatacenterThermalMap() {
    const racks = useMemo(() => generateFloorPlan(), []);
    const [hoveredRack, setHoveredRack] = useState<RackUnit | null>(null);

    // --- CONFIGURAÇÕES VISUAIS ---
    // Definimos onde cada fileira fica no grid CSS
    const getRowPosition = (rowChar: string) => {
        switch(rowChar) {
            case 'A': return 1; // Topo
            case 'B': return 2; // Meio-Topo
            case 'C': return 4; // Meio-Baixo (Pula 3 para o corredor)
            case 'D': return 5; // Baixo
            default: return 0;
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 p-8 font-sans flex justify-center items-center">
            
            <div className="w-full max-w-5xl flex gap-8">
                
                {/* --- MAPA TÉRMICO (Principal) --- */}
                <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
                    
                    <div className="flex justify-between items-start mb-6 z-10 relative">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <FiWind className="text-cyan-400" /> Mapa Térmico
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">Monitoramento de Eficiência de Resfriamento (CRAC)</p>
                        </div>
                        
                        {/* Indicadores de AC */}
                        <div className="flex gap-4">
                             <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-spin-slow">
                                    <div className="w-6 h-1 bg-cyan-500/50 rounded-full absolute"></div>
                                    <div className="w-1 h-6 bg-cyan-500/50 rounded-full absolute"></div>
                                </div>
                                <span className="text-[9px] font-bold text-cyan-500 mt-1">AC-UNIT-01</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 flex items-center justify-center animate-spin-slow" style={{ animationDirection: 'reverse' }}>
                                    <div className="w-6 h-1 bg-cyan-500/50 rounded-full absolute"></div>
                                    <div className="w-1 h-6 bg-cyan-500/50 rounded-full absolute"></div>
                                </div>
                                <span className="text-[9px] font-bold text-cyan-500 mt-1">AC-UNIT-02</span>
                             </div>
                        </div>
                    </div>

                    {/* --- O FLOOR PLAN --- */}
                    <div className="relative w-full aspect-video bg-[#121214] rounded-lg border border-zinc-800/50 overflow-hidden">
                        
                        {/* CAMADA 1: BLUR DE CALOR (O Efeito Térmico) */}
                        <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none" style={{ filter: 'blur(40px)' }}>
                            {racks.map((rack) => {
                                // Se estiver muito quente, cria uma "bolha" vermelha grande. Se frio, azul.
                                const color = rack.tempRear > 40 ? '#ef4444' : rack.tempRear > 30 ? '#f59e0b' : '#3b82f6';
                                const size = rack.tempRear > 40 ? '120px' : '80px';
                                
                                // Posicionamento aproximado baseado na fileira
                                let top = '10%';
                                if (rack.row === 'B') top = '35%';
                                if (rack.row === 'C') top = '55%';
                                if (rack.row === 'D') top = '80%';
                                
                                const left = `${(rack.col / 8) * 100}%`;

                                return (
                                    <div 
                                        key={`heat-${rack.id}`}
                                        className="absolute rounded-full transition-all duration-1000"
                                        style={{ 
                                            backgroundColor: color, 
                                            width: size, 
                                            height: size, 
                                            top, 
                                            left, 
                                            transform: 'translate(-50%, -50%)' 
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* CAMADA 2: PARTÍCULAS DE AR (Animação de Vento) */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                            {/* Corredor Frio Superior (Vento descendo) */}
                            <div className="absolute top-[15%] left-0 right-0 h-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pan-y"></div>
                            {/* Corredor Quente Central (Calor preso) */}
                            <div className="absolute top-[45%] left-0 right-0 h-10 bg-red-500/10 blur-sm"></div>
                        </div>


                        {/* CAMADA 3: RACKS FÍSICOS (Grid) */}
                        <div className="absolute inset-0 z-10 p-8 grid grid-cols-8 gap-x-2 gap-y-8 content-center">
                            {racks.map((rack) => {
                                // Ajuste de grid manual para criar corredores
                                const gridRow = getRowPosition(rack.row);
                                const isCritical = rack.status === 'critical';
                                
                                return (
                                    <div
                                        key={rack.id}
                                        onMouseEnter={() => setHoveredRack(rack)}
                                        onClick={() => setHoveredRack(rack)} // Mobile support
                                        className={`
                                            relative h-12 rounded-sm border transition-all duration-300 cursor-pointer group
                                            ${isCritical ? 'bg-red-900/40 border-red-500 animate-pulse' : 'bg-zinc-900/80 border-zinc-700 hover:border-zinc-400'}
                                        `}
                                        style={{ gridRow: gridRow }} // Posiciona na linha correta
                                    >
                                        {/* Topo do Rack (Visão aérea) */}
                                        <div className="absolute inset-1 border border-dashed border-zinc-600/50 rounded-sm flex items-center justify-center">
                                            {isCritical && <FiAlertTriangle className="text-red-500 text-xs" />}
                                        </div>
                                        
                                        {/* Tooltip Hover no próprio rack (Mini status) */}
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                                            {rack.tempRear}°C
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Rótulos de Corredores (Texto no chão) */}
                            <div className="col-span-8 row-start-3 flex items-center justify-center h-8 pointer-events-none">
                                <span className="text-red-500/50 font-bold uppercase tracking-[0.5em] text-xs blur-[0.5px]">Corredor Quente (Exaustão)</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- SIDEBAR DE DETALHES TÉRMICOS --- */}
                <div className={`w-72 bg-zinc-900 rounded-xl border border-zinc-800 p-5 shadow-2xl transition-all duration-300 ${hoveredRack ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4 pointer-events-none'}`}>
                    {hoveredRack ? (
                        <>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{hoveredRack.id}</h3>
                                    <p className="text-xs text-zinc-500 uppercase">Posição: Linha {hoveredRack.row} / Col {hoveredRack.col}</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${hoveredRack.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`}></div>
                            </div>

                            <div className="space-y-6">
                                {/* Termômetro Visual */}
                                <div className="relative h-40 bg-zinc-950 rounded-lg border border-zinc-800 w-16 mx-auto flex flex-col justify-end overflow-hidden">
                                    {/* Gradiente de fundo do termômetro */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-yellow-500 to-red-600 opacity-20"></div>
                                    
                                    {/* Nível da Temperatura */}
                                    <div 
                                        className="w-full transition-all duration-500 ease-out relative"
                                        style={{ 
                                            height: `${(hoveredRack.tempRear / 60) * 100}%`,
                                            backgroundColor: hoveredRack.tempRear > 40 ? '#ef4444' : '#3b82f6'
                                        }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/50 shadow-[0_0_10px_white]"></div>
                                    </div>

                                    {/* Texto flutuante */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-white drop-shadow-md">{hoveredRack.tempRear}°</span>
                                    </div>
                                </div>

                                {/* Métricas de Fluxo */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-zinc-800/50 p-2 rounded">
                                        <span className="text-xs text-zinc-400 flex items-center gap-2"><FiWind /> Entrada (Frio)</span>
                                        <span className="text-sm font-mono text-cyan-400">{hoveredRack.tempFront}°C</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-zinc-800/50 p-2 rounded border border-zinc-700">
                                        <span className="text-xs text-zinc-400 flex items-center gap-2 text-red-400"><FiWind /> Saída (Quente)</span>
                                        <span className="text-sm font-mono text-red-400">{hoveredRack.tempRear}°C</span>
                                    </div>
                                </div>

                                {/* Delta T (Diferença) */}
                                <div className="text-center">
                                    <span className="text-[10px] uppercase text-zinc-500 font-bold">Delta T (Ganho de Calor)</span>
                                    <p className="text-xl font-bold text-zinc-200">
                                        +{(hoveredRack.tempRear - hoveredRack.tempFront).toFixed(1)}°C
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center opacity-60">
                            <FiCpu size={40} className="mb-4" />
                            <p className="text-sm font-bold uppercase">Passe o mouse sobre um rack</p>
                            <p className="text-xs mt-2">Para ver o perfil térmico</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}