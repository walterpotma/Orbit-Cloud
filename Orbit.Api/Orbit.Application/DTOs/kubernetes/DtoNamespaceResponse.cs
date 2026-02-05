namespace Orbit.Api.Dto.kubernetes
{
    public class DtoNamespaceResponse
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreationTimestamp { get; set; }
    }
}
