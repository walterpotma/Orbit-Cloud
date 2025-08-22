namespace Orbit.Api.Model
{
    public class GitRepos
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public bool IsPrivate { get; set; }
    }
}
