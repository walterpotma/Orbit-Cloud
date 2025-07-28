"use client"
import { useState, useEffect } from "react"
import Form from "@/components/ui/form"
import Button from "@/components/ui/btn-submit"

export default function Page() {
    const [email, setEmail] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(email);
    };

    return (
        <div className="w-full h-screen bg-[var(--dark)] flex justify-center items-center">
            <Form onSubmit={handleSubmit} className="">
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <Button type="submit" className="">
                    Entrar
                </Button>
            </Form>
        </div>
    );
}