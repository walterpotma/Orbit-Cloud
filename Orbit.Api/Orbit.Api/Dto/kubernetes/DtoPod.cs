namespace Orbit.Api.Dto.kubernetes
{
    public class DtoPod
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTime? CreationTimestamp { get; set; }
    }
}
