namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoDeploymentMetrics
    {
        public string Namespace { get; set; } = string.Empty;
        public int PodCount { get; set; }
        public string CpuUsage { get; set; } = "0m";
        public string CpuLimit { get; set; } = "0m";
        public string MemoryUsage { get; set; } = "0 MiB";
        public string MemoryLimit { get; set; } = "0 MiB";
        // Adicione outros campos que você desejar aqui
    }
    public class DtoPodInstantMetrics
    {
        public string PodName { get; set; } = string.Empty;
        
        // Valores consolidados (soma de todos os containers do pod)
        public double TotalCpuUsageNano { get; set; }
        public long TotalMemoryUsageBytes { get; set; }

        // Formatação amigável para o Orbit.UI (Ex: "150m", "256 MiB")
        public string CpuUsageDisplay { get; set; } = "0m";
        public string MemoryUsageDisplay { get; set; } = "0 MiB";

        public List<DtoContainerInstantMetrics> Containers { get; set; } = new();
    }

    public class DtoContainerInstantMetrics
    {
        public string ContainerName { get; set; } = string.Empty;
        public double CpuUsageNano { get; set; }
        public long MemoryUsageBytes { get; set; }
    }
}