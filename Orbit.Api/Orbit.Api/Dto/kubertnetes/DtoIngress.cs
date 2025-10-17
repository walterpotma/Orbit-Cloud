namespace Orbit.Api.Dto.kubertnetes
{
    public class DtoIngress
    {
        public string Name { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public IEnumerable<string> Hosts { get; set; } = Enumerable.Empty<string>();
    }
}
