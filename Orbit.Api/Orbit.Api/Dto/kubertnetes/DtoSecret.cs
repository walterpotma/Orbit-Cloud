namespace Orbit.Api.Dto.kubertnetes
{
    public class DtoSecret
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
