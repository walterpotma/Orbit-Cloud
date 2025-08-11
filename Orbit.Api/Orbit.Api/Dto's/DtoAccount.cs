using System.Text.Json.Serialization;

namespace Orbit.Api.Dto_s
{
    public class DtoAccount
    {
        [JsonPropertyName("nome")]
        public string? Nome { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }
    }
}
