"use client";
import { useEffect } from "react";
import { VARIABLE_API_URL } from "@/settings/variables";

export default function Page() {
    useEffect(() => {
        window.location.href = `${VARIABLE_API_URL}/github/login`;
    }, []);
    return (null);
}