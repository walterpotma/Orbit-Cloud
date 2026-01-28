"use client";
import EmptyState from "@/components/ui/EmptyState";
import CardDeploy from "@/features/dashboard/components/card-deploy";

interface TableProps {
    deployments: any[];
}

export default function Table({ deployments }: TableProps) {
    return (
        <div className="w-full mt-4">
            {deployments.length === 0 ? (
                <EmptyState
                    title="Nenhuma Aplicação Rodando"
                    description="Seu ambiente está limpo. Que tal fazer o deploy do seu primeiro projeto agora mesmo?"
                    icon="bi bi-rocket-takeoff"
                    actionLabel="Novo Deploy"
                    onAction={() => window.location.href = '/deploy/new'}
                />
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {deployments.map(deploy => (
                        <CardDeploy
                            key={deploy.name}
                            name={deploy.name}
                            namespace={deploy.namespace}
                            status={deploy.status}
                            ready={deploy.replicasReady}
                            desired={deploy.replicasDesired}
                            age={deploy.age}
                            tag={deploy.imageTag}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}