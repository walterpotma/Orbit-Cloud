"use client"
import Input1 from "@/components/ui/input1";

export default function Page() {
    return (
        <div className="w-full p-4">
            <div>
                <h1 className="text-xl font-bold pb-4 mb-4 border-b border-slate-800">Perfil</h1>
            </div>
            <div className="w-full flex justify-start items-start space-x-10">
                <div>
                    <form action="">
                        <Input1 label="Nome/Apelido:"/>
                        <Input1 label="Email:"/>
                        <Input1/>
                        <Input1/>
                    </form>
                </div>
                <div>
                    <img src="" alt="" />
                    <h1>Nome</h1>
                    <p>Cargo</p>
                </div>
            </div>
        </div>
    );
}