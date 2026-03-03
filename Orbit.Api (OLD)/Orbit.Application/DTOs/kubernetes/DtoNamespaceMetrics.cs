namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoNamespaceMetrics
    {
        public string Namespace { get; set; }
        public int PodCount { get; set; }

        public string CpuUsage { get; set; }
        public string MemoryUsage { get; set; }
        public decimal RawCpu { get; set; }
        public long RawMemory { get; set; }

        public string CpuLimit { get; set; }
        public string MemoryLimit { get; set; }
        public decimal RawCpuLimit { get; set; }
        public long RawMemoryLimit { get; set; }
    }
}
