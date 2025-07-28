"use client"
import { useState, useEffect, ReactNode } from "react";

type FormProps = {
    children: ReactNode;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
};

export default function Page({ children, onSubmit, className }: FormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className={`w-md p-10 rounded-2xl bg-[var(--glass)] border border-neutral-700 flex flex-col ${className}`}
        >
            {children}
        </form>
    );
}