"use client";
import Logo from "@/shared/layout/logo";
import LogoTeste from "@/shared/layout/logo";
import CardDeploy from "@/features/dashboard/components/dash-card";

export default function Page() {
    return (
        <div className="flex justify-center items-center w-full h-screen">
            <div className="w-96">
                <CardDeploy
                    name="teste"
                    namespace="testing"
                    status="Running"
                    ready={2}
                    desired={5}
                    age={"0"}
                    tag={"0.0.0"}
                />
            </div>
        </div>
    );
}