using System.Text.Json.Serialization;

namespace Orbit.Api.Dto.Github
{
    public class DtoGithub
    {
        [JsonPropertyName("Id")]
        public int Id { get; set; }

        [JsonPropertyName("GithubId")]
        public int GithubId { get; set; }

        [JsonPropertyName("Name")]
        public string? Name { get; set; }

        [JsonPropertyName("Email")]
        public string? Email { get; set; }
    }
}
