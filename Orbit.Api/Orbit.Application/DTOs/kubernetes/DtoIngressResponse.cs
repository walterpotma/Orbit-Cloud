namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoIngressResponse
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public DateTime? CreationTimestamp { get; set; }
        public string? IngressClassName { get; set; }
        public List<string>? Endpoints { get; set; }
        public List<DtoIngressRuleResponse>? Rules { get; set; }
        public List<DtoIngressTlsResponse>? Tls { get; set; }
    }

    public class DtoIngressRuleResponse
    {
        public string? Host { get; set; }
        public string? ServiceName { get; set; }
        public int ServicePort { get; set; }
    }

    public class DtoIngressTlsResponse
    {
        public string? SecretName { get; set; }
        public List<string>? Hosts { get; set; }
    }
}
