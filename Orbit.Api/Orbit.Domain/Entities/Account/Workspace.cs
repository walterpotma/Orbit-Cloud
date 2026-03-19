namespace Orbit.Domain.Entities
{
    public class Workspace
    {
        public string Id { get; set; }
        public string OwnerGithubId { get; set; }
        public string? GithubInstallationId { get; set; }
    }
}