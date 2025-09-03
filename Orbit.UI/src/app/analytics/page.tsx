"use client";
import GraphDeploys from "@/components/analytics/graph-deploys";
import GraphResources from "@/components/analytics/graph-resources";

export default function Page() {
    return (
        <div>
            <GraphDeploys />
            <GraphResources />
        </div>
    );
}