using System.Text.Json.Serialization;

namespace Orbit.Api.Dto.Github
{
    public class DtoWebhookResponse
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("active")]
        public bool Active { get; set; }

        [JsonPropertyName("events")]
        public List<string>? Events { get; set; }

        [JsonPropertyName("config")]
        public DtoGithubWebhookConfig? Config { get; set; }
    }
    
    public class DtoGithubWebhookConfig
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("content_type")]
        public string? ContentType { get; set; }
    }
}
