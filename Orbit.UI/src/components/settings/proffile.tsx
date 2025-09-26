"use client"
import Input1 from "@/components/ui/form/input";

export default function Page() {
    return (
        <div className="w-full p-4">
            <div>
                <h1 className="text-xl font-bold pb-4 mb-4 border-b border-slate-800">Perfil</h1>
            </div>
            <div className="w-full flex justify-start items-start space-x-10">
                <div className="w-full">
                    <form className="w-full">
                        <Input1 label="Nome/Apelido:"/>
                        <Input1 label="Email:"/>
                        <Input1 label="Senha:"/>
                        <Input1 label="Role"/>
                        <Input1 label="Equipe"/>
                    </form>
                </div>
            </div>
        </div>
    );
}