namespace Orbit.Api.Dto.kubertnetes
{
    public class DtoDeployment
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public int Replicas { get; set; }
        public string Image { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreationTimestamp { get; set; }
    }
}
