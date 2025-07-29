"use client"
import { useState, useEffect } from "react"
import Form from "@/components/ui/form"
import Button1 from "@/components/ui/button1"
import Logo from "@/components/layout/logo"
import Input1 from "@/components/ui/input1"

export default function Page() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [checked, setChecked] = useState(true);

    useEffect(() => {
        if(localStorage.getItem("email") != null && localStorage.getItem("senha") != null){
            setEmail(localStorage.getItem("email") ?? "");
            setSenha(localStorage.getItem("senha") ?? "");
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(email);
        console.log(senha);

        if(checked == true){
            localStorage.setItem("email", email);
            localStorage.setItem("senha", senha);
        }
    };

    return (
        <div className="w-full h-screen bg-[var(--darker)] flex justify-center items-center">
            <Form onSubmit={handleSubmit} className="">
                <Logo className="w-full"/>
                <h1 className="w-full text-center text-2xl font-bold">Bem vindo de volta!</h1>
                <h2 className="w-full text-center text-slate-500 mb-5">Entre com sua conta no Orbit CI/CD</h2>
                <Input1 label="Email:" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu Email" className="" />
                <Input1 label="Senha:" type="text" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua Senha" className="" />
                <div className="my-3 flex justify-between items-center">
                    <div className="flex justify-center items-center space-x-1">
                        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}/>
                        <label htmlFor="">Lembrar de Mim</label>
                    </div>
                    <button className="text-blue-500 cursor-pointer hover:text-blue-400 hover:underline transition ease-in-out duration-200">Esqueceu a Senha?</button>
                </div>
                <Button1 type="submit" className="">
                    Entrar
                </Button1>
            </Form>
        </div>
    );
}