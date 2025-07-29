"use client"
import { useState, useEffect } from "react"
import Form from "@/components/ui/form"
import Button1 from "@/components/ui/button1"
import Logo from "@/components/layout/logo"
import Input1 from "@/components/ui/input1"

export default function Page() {
    const [nome, setNome] = useState("");
    const [sobreNome, setSobreNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [checked, setChecked] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(nome, sobreNome);
        console.log(email);
        console.log(senha);
        console.log(confirmarSenha);
    };

    return (
        <div className="w-full h-screen bg-[var(--darker)] flex justify-center items-center">
            <Form onSubmit={handleSubmit} className="">
                <Logo className="w-full"/>
                <h1 className="w-full text-center text-2xl font-bold">Crie sua Conta!</h1>
                <h2 className="w-full text-center text-slate-500 mb-5">Inicie sua Historia com o Orbit CI/CD</h2>
                <div className="w-full flex justify-between items-center space-x-5">
                    <Input1 label="Nome:" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu primeiro Nome" className="" />
                    <Input1 label="Sobrenome:" type="text" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Seu Sobrenome" className="" />
                </div>
                <Input1 label="Email:" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu Email" className="" />
                <Input1 label="Senha:" type="text" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua Senha" className="" />
                <div className="my-2 flex justify-start items-start space-x-2">
                    <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-2"/>
                    <label htmlFor="">Eu aceito os <a href="" className="text-blue-500">Termos de Serviço</a> e <a href="" className="text-blue-500">Política de Privacidade</a></label>
                </div>
                <Button1 type="submit" className="">
                    Entrar
                </Button1>
            </Form>
        </div>
    );
}