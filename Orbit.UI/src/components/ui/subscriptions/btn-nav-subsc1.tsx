"use client";

type buttonProps = {
    title: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}

export default function Button({ title, icon, isActive, onClick }: buttonProps) {
    return (
        <div className="flex items-end">
            {isActive && (
                <div className="bg-slate-900">
                    <div className="p-2 rounded-lg rounded-t-none rounded-l-none bg-slate-950"></div>
                </div>
            )}
            <button className={`w-full px-2 py-1 rounded-t-lg flex justify-center items-center space-x-1 hover:bg-slate-900 hover:text-blue-500 cursor-pointer`}>
                <i className="bi bi-feather"></i>
                <p>{title}</p>
            </button>
            {isActive && (
                <div className="bg-slate-900">
                    <div className="p-2 rounded-lg rounded-t-none rounded-r-none bg-slate-950"></div>
                </div>
            )}
        </div>
    );
}