namespace Orbit.Api.Dto.kubernetes
{
    public class DtoSecretRequest
    {
        public string? Name { get; set; }
        public string? Namespace { get; set; }
        public Dictionary<string, string>? Data { get; set; }
    }
}
