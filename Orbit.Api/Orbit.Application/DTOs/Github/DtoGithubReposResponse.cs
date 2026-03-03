namespace Orbit.Application.DTOs.Github
{
    public class DtoGithubReposResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public bool IsPrivate { get; set; }
    }
}