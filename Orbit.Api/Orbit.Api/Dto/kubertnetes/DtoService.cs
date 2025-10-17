namespace Orbit.Api.Dto.kubertnetes
{
    public class DtoService
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string ClusterIp { get; set; } = string.Empty;
        public IEnumerable<string> Ports { get; set; } = Enumerable.Empty<string>();
    }
}
