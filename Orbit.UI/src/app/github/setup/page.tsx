"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// 1. Crie um componente que realmente usa os parâmetros
function SetupContent() {
    const searchParams = useSearchParams();
    const installationId = searchParams.get('installation_id');

    if (installationId) {
        localStorage.setItem("app_id", installationId);
    }
    
    return (
        <div>
            <p>Configurando instalação: {installationId}</p>
        </div>
    );
}

// 2. A página principal apenas envolve o conteúdo em Suspense
export default function GithubSetupPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1>Finalizando Integração</h1>
            <Suspense fallback={<p>Carregando dados do GitHub...</p>}>
                <SetupContent />
            </Suspense>
        </div>
    );
}