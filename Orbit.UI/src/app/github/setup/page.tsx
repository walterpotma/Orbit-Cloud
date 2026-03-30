"use client";
import { useSearchParams } from 'next/navigation';

export default function GithubSetupPage() {
    const searchParams = useSearchParams();
    const installationId = searchParams.get('installation_id');

    if (installationId) {
        localStorage.setItem("app_id", installationId);
    }

    return <div>Instalação concluída! ID: {installationId}</div>;
}