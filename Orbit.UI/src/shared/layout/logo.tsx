"use client"
import { useState, useEffect, ReactNode } from "react";

type LogoProps = {
  className?: string;
};

export default function Logo ({className}: LogoProps) {
    return (
        <div className={`flex justify-center items-center py-2 px-1 rounded-xl bg-white ${className}`}>
            <img src="/new-orbit.png" alt="Logo" className="w-14"/>
        </div>
    );
}