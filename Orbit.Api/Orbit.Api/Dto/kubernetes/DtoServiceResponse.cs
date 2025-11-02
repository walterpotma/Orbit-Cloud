namespace Orbit.Api.Dto.kubernetes
{
    public class DtoServiceResponse
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public DateTime? CreationTimestamp { get; set; }
        public string? Type { get; set; }
        public string? ClusterIp { get; set; }
        public string? ExternalIp { get; set; }
        public Dictionary<string, string>? Selector { get; set; }
        public List<string>? Ports { get; set; }
    }
}
