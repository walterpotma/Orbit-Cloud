namespace Orbit.Api.Dto.kubernetes
{
    public class DtoServiceRequest
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public string Type { get; set; } = "ClusterIP";
        public List<DtoServicePortRequest> Ports { get; set; } = new List<DtoServicePortRequest>();
        public Dictionary<string, string>? Selector { get; set; }
    }
    public class DtoServicePortRequest
    {
        public int Port { get; set; }
        public int TargetPort { get; set; }
        public string Protocol { get; set; } = "TCP";
        public int? NodePort { get; set; }
    }
}
