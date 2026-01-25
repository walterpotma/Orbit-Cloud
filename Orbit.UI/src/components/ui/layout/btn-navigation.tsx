"use client";

type ButtonProps = {
    text?: string;
    open?: boolean;
    icon?: string;
    active?: boolean;
    onClick?: () => void;
    className?: string;
};

export default function Button({ text, icon, active, onClick, className, open }: ButtonProps) {
    const activeStyles = active ? 'bg-slate-800 text-blue-500 border-l-2' : 'text-slate-400';

    return (
        <button onClick={onClick} className={`w-full py-4 flex ${open ? 'justify-center px-4' : 'justify-start px-10'} items-center cursor-pointer hover:bg-slate-800 hover:text-blue-500 hover:border-l-2 border-blue-500 ${activeStyles} ${className}`}>
            <i className={`bi bi-${icon} ${open ? '' : 'mr-2'} text-lg`}></i>
            <span className={`${open ? 'hidden' : ''}`}>{text}</span>
        </button>
    );
}