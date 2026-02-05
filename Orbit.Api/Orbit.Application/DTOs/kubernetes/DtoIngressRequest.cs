namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoIngressRequest
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public string? IngressClassName { get; set; }
        public string? Host { get; set; }
        public string? ServiceName { get; set; }
        public int ServicePort { get; set; }
        public DtoIngressTlsRequest? Tls { get; set; }
    }
    public class DtoIngressTlsRequest
    {
        public string? SecretName { get; set; }
        public string? Host { get; set; }
    }
}
