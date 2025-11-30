namespace Orbit.Api.Dto.kubernetes
{
    public class DtoNamespaceMetrics
    {
        public string Namespace { get; set; }
        public int PodCount { get; set; }

        // Valores formatados para exibição (ex: "500m", "1.2 Gi")
        public string CpuUsage { get; set; }
        public string MemoryUsage { get; set; }

        // Valores brutos para ordenação ou barras de progresso no Front
        public decimal RawCpu { get; set; }
        public long RawMemory { get; set; }
    }
}
