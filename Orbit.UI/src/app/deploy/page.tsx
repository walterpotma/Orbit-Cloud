"use client"
import { Database, GitBranch, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import 'devicon/devicon.min.css';
import NewDeploy from "@/components/deploy/new-deploy";
import EditDeploy from "@/components/deploy/edit-deploy";
import BtnRefresh from "@/components/ui/BtnRefresh";
import { Deployments } from "@/api/kubernetes";
import { useUser } from "@/context/user";
import TableDeploy from "@/components/deploy/table";

export default function Page() {
    const { UserData, isLoading } = useUser();
    const [deployments, setDeployments] = useState<any[]>([]);
    const [newDeploy, setNewDeploy] = useState(false);
    const [editDeploy, setEditDeploy] = useState(false);

    useEffect(() => {
        if (isLoading || !UserData || !UserData.githubID) {
            return;
        }
        Deployments.List(UserData.githubID)
            .then((response: any) => {
                console.log(response.data);
                setDeployments(response.data);
            })
            .catch((error: any) => {
                console.error("Error fetching Deployments:", error);
            });
    }, [UserData, isLoading]);

    return (
        <div className="w-full h-full px-8 py-8 flex flex-col justify-start items-start overflow-auto custom-scroll">
            <div className="w-full">
                <div className="w-full mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Deploys</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <button onClick={() => setNewDeploy(true)} className="px-4 py-2 rounded-lg border-1 border-blue-600 text-blue-600 text-sm cursor-pointer hover:bg-blue-500 hover:text-white transition ease-in-out duration-200">Novo Deploy</button>
                        <BtnRefresh />
                    </div>
                </div>
                <TableDeploy deployments={deployments} />
            </div>

            {newDeploy && (
                <NewDeploy onClose={setNewDeploy} />
            )}

            {editDeploy && (
                <div className="w-full absolute top-10 left-0 z-50">
                    <EditDeploy onClose={setEditDeploy} />
                </div>
            )}

        </div>
    );
}