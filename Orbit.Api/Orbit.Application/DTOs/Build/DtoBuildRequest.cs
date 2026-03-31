namespace Orbit.Application.DTOs.Build
{
    public class DtoBuildRequest
    {
        public long InstallationId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string CloneUrl { get; set; } = string.Empty;
        public string RepoName { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
    }
}