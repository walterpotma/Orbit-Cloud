export interface NetworkRuleProps {
    rules: Array<{
        id: string;
        name: string;
        type: "External" | "Internal"; // Ingress = External, Service = Internal
        address: string;
        target: string;
        status: string;
    }>;
}

export interface NetworkRule {
    id: string;
    name: string;
    type: "External" | "Internal";
    address: string;
    target: string;
    status: string;
}