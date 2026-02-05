using System.Text.Json.Serialization;

namespace Orbit.Api.Dto.Github
{
    public class DtoReposResponse
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("full_name")]
        public string FullName { get; set; }

        [JsonPropertyName("private")]
        public bool IsPrivate { get; set; }

        [JsonPropertyName("html_url")]
        public string Url { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("language")]
        public string Language { get; set; }

        [JsonPropertyName("stargazers_count")]
        public int Stars { get; set; }
    }
}
