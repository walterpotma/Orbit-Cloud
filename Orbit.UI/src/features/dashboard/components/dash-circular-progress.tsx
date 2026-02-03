"use client";

export default function CircularProgress({ percentage, color, icon: Icon, label, subLabel }: any) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
            <div className="relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`${color} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                </svg>
                <div className={`absolute ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="text-center mt-2">
                <p className="text-lg font-bold text-zinc-200">{Math.round(percentage)}%</p>
                <p className="text-xs text-zinc-500 font-medium">{label}</p>
                <p className="text-[10px] text-zinc-600 font-mono mt-1">{subLabel}</p>
            </div>
        </div>
    );
};