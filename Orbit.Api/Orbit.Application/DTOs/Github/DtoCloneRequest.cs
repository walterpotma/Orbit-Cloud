namespace Orbit.Application.DTOs.Github
{
    public class DtoCloneRequest
    {
        public long InstallationId { get; set; }
        public string AppName { get; set; } = string.Empty;
        public string CloneUrl { get; set; } = string.Empty;
    }
}