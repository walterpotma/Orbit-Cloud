namespace Orbit.Api.Dto.github
{
    public class DtoCloneRequest
    {
        public string RepositoryUrl { get; set; } = string.Empty; // Ex: https://github.com/usuario/projeto.git
        public string Branch { get; set; } = "main";
        public string ProjectName { get; set; } = string.Empty;
    }
}
