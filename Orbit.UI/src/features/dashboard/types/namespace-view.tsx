export interface NamespaceMetric {
    namespace: string;
    podCount: number;
    cpuUsage: string;
    memoryUsage: string;
    rawCpu: number;
    rawMemory: number;
}