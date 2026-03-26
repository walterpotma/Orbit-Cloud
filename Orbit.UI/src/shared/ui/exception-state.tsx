"use client";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    title = "Sem Resultados",
    description = "Nenhum item encontrado nesta lista.",
    icon = "bi bi-inbox",
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 transition-colors duration-300">

            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/10">
                <i className={`${icon} text-3xl text-blue-500`}></i>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
                {title}
            </h3>

            <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed mb-6">
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="group flex items-center gap-2 px-5 py-2.5 border-2 border-blue-700 hover:bg-blue-700 text-blue-500 hover:text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-blue-600/20 cursor-pointer"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}