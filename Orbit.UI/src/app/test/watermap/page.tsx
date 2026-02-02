"use client";

import { useState, useMemo, useRef } from "react";
import { FiAlertCircle, FiCheckCircle, FiDatabase, FiGlobe, FiServer, FiShield, FiClock } from "react-icons/fi";

// --- TIPAGEM ---
type SpanStatus = "ok" | "error";
type SpanType = "http" | "db" | "cache" | "auth" | "external";

interface TraceSpan {
    id: string;
    parentId: string | null;
    service: string;
    operation: string;
    startTime: number; // ms relativo ao início (0)
    duration: number;  // ms
    status: SpanStatus;
    type: SpanType;
    meta?: Record<string, string>;
}

// --- DADOS FAKES (Uma requisição de Checkout lenta) ---
const traceData: TraceSpan[] = [
    { id: "span-1", parentId: null, service: "Front-end", operation: "POST /checkout", startTime: 0, duration: 450, status: "ok", type: "http" },
    { id: "span-2", parentId: "span-1", service: "API Gateway", operation: "Route Request", startTime: 10, duration: 430, status: "ok", type: "http" },
    { id: "span-3", parentId: "span-2", service: "Auth Service", operation: "Verify Token", startTime: 20, duration: 50, status: "ok", type: "auth" },
    { id: "span-4", parentId: "span-3", service: "Redis", operation: "GET session:123", startTime: 25, duration: 5, status: "ok", type: "cache" },
    { id: "span-5", parentId: "span-2", service: "Order Service", operation: "Create Order", startTime: 80, duration: 350, status: "error", type: "http" },
    { id: "span-6", parentId: "span-5", service: "Postgres", operation: "INSERT INTO orders", startTime: 90, duration: 40, status: "ok", type: "db" },
    { id: "span-7", parentId: "span-5", service: "Payment Provider", operation: "POST /charge", startTime: 140, duration: 200, status: "error", type: "external", meta: { error: "Timeout Gateway 504" } },
    { id: "span-8", parentId: "span-5", service: "Email Service", operation: "Send Confirmation", startTime: 350, duration: 60, status: "ok", type: "http" },
];

export default function TraceWaterfallViewer() {
    const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
    const [cursorTime, setCursorTime] = useState<number | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // --- CÁLCULOS ---
    const totalDuration = Math.max(...traceData.map(s => s.startTime + s.duration));

    // Achata a árvore e calcula profundidade para indentação
    const processedSpans = useMemo(() => {
        const result: (TraceSpan & { depth: number })[] = [];
        const process = (parentId: string | null, depth: number) => {
            const children = traceData.filter(s => s.parentId === parentId);
            // Ordena por tempo de início
            children.sort((a, b) => a.startTime - b.startTime);
            children.forEach(child => {
                result.push({ ...child, depth });
                process(child.id, depth + 1);
            });
        };
        process(null, 0);
        return result;
    }, []);

    // --- HELPERS VISUAIS ---
    const getIcon = (type: SpanType) => {
        switch (type) {
            case "db": return <FiDatabase />;
            case "cache": return <FiServer />;
            case "auth": return <FiShield />;
            case "external": return <FiGlobe />;
            default: return <FiServer />;
        }
    };

    const getTypeColor = (type: SpanType, status: SpanStatus) => {
        if (status === "error") return "bg-red-500";
        switch (type) {
            case "db": return "bg-purple-500";
            case "cache": return "bg-amber-500";
            case "auth": return "bg-emerald-500";
            case "external": return "bg-pink-500";
            default: return "bg-blue-500";
        }
    };

    // Calcula a posição da régua de tempo
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ms = (x / rect.width) * totalDuration;
        setCursorTime(Math.max(0, Math.min(ms, totalDuration)));
    };

    return (
        <div className="w-full min-h-screen bg-zinc-950 p-8 font-sans flex justify-center items-start">
            
            <div className="w-full max-w-6xl bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                            <span className="p-1.5 bg-zinc-800 rounded text-zinc-400"><FiClock /></span>
                            Trace: <span className="font-mono text-zinc-400">#8a2b-9c1f</span>
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1 ml-9">POST /checkout • 200 OK • {totalDuration}ms</p>
                    </div>
                    {/* Legenda Mini */}
                    <div className="flex gap-3 text-[10px] font-bold uppercase text-zinc-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> App</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> DB</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div> External</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Error</span>
                    </div>
                </div>

                {/* --- ÁREA PRINCIPAL --- */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Coluna Esquerda: Nomes dos Serviços (Tree View) */}
                    <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 flex-shrink-0 overflow-y-auto overflow-x-hidden">
                        {/* Header da Coluna */}
                        <div className="h-8 border-b border-zinc-800/50 flex items-center px-4 text-[10px] font-bold text-zinc-500 uppercase">
                            Serviço / Operação
                        </div>
                        {processedSpans.map((span) => (
                            <div 
                                key={span.id}
                                className={`h-9 flex items-center px-4 border-b border-zinc-800/30 cursor-pointer hover:bg-zinc-800/50 transition-colors ${selectedSpanId === span.id ? 'bg-zinc-800 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                                style={{ paddingLeft: `${(span.depth * 16) + 16}px` }}
                                onClick={() => setSelectedSpanId(span.id)}
                            >
                                <div className={`mr-2 ${span.status === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>
                                    {getIcon(span.type)}
                                </div>
                                <div className="truncate">
                                    <div className="text-xs font-bold text-zinc-300 truncate leading-tight">{span.service}</div>
                                    <div className="text-[10px] text-zinc-500 truncate leading-tight">{span.operation}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coluna Direita: Timeline (Waterfall) */}
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        
                        {/* Régua de Tempo (Topo) */}
                        <div className="h-8 border-b border-zinc-800/50 bg-zinc-900/30 relative select-none">
                            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                                <div key={tick} className="absolute top-0 bottom-0 border-l border-zinc-800 text-[9px] text-zinc-600 pl-1 pt-2 font-mono" style={{ left: `${tick * 100}%` }}>
                                    {(totalDuration * tick).toFixed(0)}ms
                                </div>
                            ))}
                        </div>

                        {/* Área das Barras */}
                        <div 
                            ref={timelineRef}
                            className="flex-1 overflow-y-auto relative custom-scrollbar"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setCursorTime(null)}
                        >
                            {/* Linhas de Grade Verticais */}
                            {[0.25, 0.5, 0.75].map((tick) => (
                                <div key={tick} className="absolute top-0 bottom-0 border-l border-zinc-800/30 pointer-events-none" style={{ left: `${tick * 100}%` }}></div>
                            ))}

                            {/* Cursor Vermelho Interativo */}
                            {cursorTime !== null && (
                                <div 
                                    className="absolute top-0 bottom-0 w-[1px] bg-red-500/50 z-30 pointer-events-none flex flex-col items-center"
                                    style={{ left: `${(cursorTime / totalDuration) * 100}%` }}
                                >
                                    <div className="bg-red-500 text-white text-[9px] px-1 rounded-sm mt-1 font-mono">
                                        {cursorTime.toFixed(0)}ms
                                    </div>
                                </div>
                            )}

                            {/* Renderização das Barras */}
                            {processedSpans.map((span) => {
                                const leftPercent = (span.startTime / totalDuration) * 100;
                                const widthPercent = Math.max((span.duration / totalDuration) * 100, 0.5); // Min 0.5% width
                                const isSelected = selectedSpanId === span.id;

                                return (
                                    <div 
                                        key={span.id}
                                        className={`h-9 border-b border-zinc-800/30 relative flex items-center group ${isSelected ? 'bg-zinc-800/30' : ''}`}
                                        onClick={() => setSelectedSpanId(span.id)}
                                    >
                                        {/* A Barra do Span */}
                                        <div 
                                            className={`
                                                absolute h-5 rounded-[2px] shadow-sm border border-black/20 text-xs flex items-center overflow-visible
                                                ${getTypeColor(span.type, span.status)} 
                                                ${isSelected ? 'ring-1 ring-white' : 'opacity-80 hover:opacity-100'}
                                                transition-all
                                            `}
                                            style={{ 
                                                left: `${leftPercent}%`, 
                                                width: `${widthPercent}%`,
                                            }}
                                        >
                                            {/* Label dentro ou fora da barra dependendo do tamanho */}
                                            <span className={`
                                                whitespace-nowrap px-2 font-mono font-bold drop-shadow-md select-none
                                                ${widthPercent < 10 ? 'absolute left-full text-zinc-400' : 'text-white/90'}
                                            `}>
                                                {span.duration}ms
                                            </span>
                                        </div>

                                        {/* Conector Visual (Linha que liga pai ao filho) - Opcional, para refinar o look */}
                                        {/* (Pode ser implementado com SVG absoluto no fundo, mas aqui simplificamos para manter código limpo) */}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Painel de Detalhes (Slide-in na direita) */}
                    <div className={`w-72 bg-zinc-950 border-l border-zinc-800 p-6 transition-all duration-300 absolute right-0 top-8 bottom-0 shadow-2xl ${selectedSpanId ? 'translate-x-0' : 'translate-x-full'}`}>
                         {selectedSpanId && (() => {
                             const span = traceData.find(s => s.id === selectedSpanId)!;
                             return (
                                 <div className="h-full flex flex-col">
                                     <div className="flex justify-between items-start mb-6">
                                         <h3 className="font-bold text-zinc-100">Detalhes do Span</h3>
                                         <button onClick={() => setSelectedSpanId(null)} className="text-zinc-500 hover:text-white"><FiX /></button>
                                     </div>
                                     
                                     <div className="space-y-6">
                                         <div>
                                             <p className="text-xs text-zinc-500 uppercase font-bold">Operação</p>
                                             <p className="text-sm text-cyan-400 font-mono break-all">{span.operation}</p>
                                         </div>
                                         
                                         <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                 <p className="text-xs text-zinc-500 uppercase font-bold">Duração</p>
                                                 <p className="text-zinc-200">{span.duration}ms</p>
                                             </div>
                                             <div>
                                                 <p className="text-xs text-zinc-500 uppercase font-bold">Início</p>
                                                 <p className="text-zinc-200">+{span.startTime}ms</p>
                                             </div>
                                         </div>

                                         <div>
                                             <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Status</p>
                                             <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${span.status === 'ok' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                                 {span.status === 'ok' ? <FiCheckCircle /> : <FiAlertCircle />}
                                                 <span className="font-bold text-xs uppercase">{span.status}</span>
                                             </div>
                                         </div>

                                         {span.meta && (
                                             <div className="bg-red-900/20 border border-red-500/30 p-3 rounded text-xs text-red-300 font-mono break-all">
                                                 {JSON.stringify(span.meta, null, 2)}
                                             </div>
                                         )}
                                         
                                         <div className="mt-auto">
                                            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs font-bold text-zinc-300 uppercase transition-colors">
                                                Ver Logs Associados
                                            </button>
                                         </div>
                                     </div>
                                 </div>
                             )
                         })()}
                    </div>

                </div>
            </div>
        </div>
    );
}

// Pequeno helper para o ícone de fechar que esqueci no import
function FiX(props: any) { return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>; }