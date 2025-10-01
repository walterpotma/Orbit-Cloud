using System.Text.Json.Serialization;

namespace Orbit.Api.Dto_s
{
    public class DtoAccount
    {
        public int Id { get; set; } 
        public string? GithubId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Plano { get; set; }
    }
}
