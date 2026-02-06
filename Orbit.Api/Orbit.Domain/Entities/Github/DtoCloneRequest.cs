namespace Orbit.Domain.Entities.Github;
{
    public class DtoCloneRequest
    {
        public string RepositoryUrl { get; set; } = string.Empty;
        public string Branch { get; set; } = "main";
        public string ProjectName { get; set; } = string.Empty;
    }
}
