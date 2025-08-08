"use client"
import { useState, useEffect, ReactNode } from "react";

type LogoProps = {
  className?: string;
};

export default function Logo ({className}: LogoProps) {
    return (
        <div className={`px-4 flex justify-center items-center ${className}`}>
            <img src="/orbit3.png" alt="Logo" className="w-16"/>
            <p className="text-3xl font-bold">Orbit</p>
        </div>
    );
}