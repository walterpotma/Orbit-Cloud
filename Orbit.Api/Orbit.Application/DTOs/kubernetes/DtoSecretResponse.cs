namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoSecretResponse
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public DateTime? CreationTimestamp { get; set; }
        public string? Type { get; set; }
        public IEnumerable<string>? Keys { get; set; }
    }
}
