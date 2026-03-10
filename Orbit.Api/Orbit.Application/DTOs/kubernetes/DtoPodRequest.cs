namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoPodRequest
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public string? Image { get; set; }
        public int? ContainerPort { get; set; }
        public Dictionary<string, string>? EnvVariables { get; set; }
    }
}
