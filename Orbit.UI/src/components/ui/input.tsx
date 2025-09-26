"use client"
import { ReactNode, ChangeEvent } from "react";

type Input1Props = {
    label?: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
};

export default function Input ({label, type = 'text', value, onChange, placeholder, className}: Input1Props) {
    return (
        <div className="w-full my-2 flex flex-col space-y-0.5">
            {label && <label className=" text-slate-400">{label}</label>}
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                className={`w-full py-2 px-4 rounded-lg bg-slate-900 text-slate-500 text-md outline-0 ${className}`}
            />
        </div>
    );
}