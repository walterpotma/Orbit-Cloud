"use client";

type ButtonProps = {
    text?: string;
    icon?: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
};

export default function Button({ text, icon, active, onClick, className }: ButtonProps) {
    const activeStyles = active ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400';

    return (
        <button onClick={onClick} className={`w-full py-4 px-10 flex justify-start items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${activeStyles} ${className}`}>
            <i className={`bi bi-${icon} mr-2 text-lg`}></i>
            {text}
        </button>
    );
}