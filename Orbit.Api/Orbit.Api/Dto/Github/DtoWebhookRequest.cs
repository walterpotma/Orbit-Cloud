using System.ComponentModel.DataAnnotations;

namespace Orbit.Api.Dto.Github
{
    public class DtoWebhookRequest
    {
        [Required]
        [Url]
        public string? Url { get; set; }
        public List<string> Events { get; set; } = new List<string> { "push" };
        public string ContentType { get; set; } = "json";
    }
}
