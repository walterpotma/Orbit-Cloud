namespace Orbit.Api.Dto.kubernetes
{
    public class DtoPodResponse
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public string? Status { get; set; }
        public string? PodIp { get; set; }
        public string? NodeName { get; set; }
        public int RestartCount { get; set; }
        public DateTime? CreationTimestamp { get; set; }
        public string? ReadyStatus { get; set; }
        public List<string>? Images { get; set; }
    }
}
