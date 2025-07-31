"use client"
import { useState, useEffect, ReactNode } from "react";

type BtnProps = {
    children: ReactNode;
    type?: "submit" | "button" | "reset";
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
};

export default function Page({ children, type, className }: BtnProps) {
    return (
        <button type={type || "submit"} className={`w-full py-3 rounded-lg bg-blue-500 cursor-pointer hover:bg-blue-600 transition ease-in-out duration-200 ${className}`}>
            {children}
        </button>
    );
}