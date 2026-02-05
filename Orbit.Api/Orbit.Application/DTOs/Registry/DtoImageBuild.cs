using System.ComponentModel.DataAnnotations;

namespace Orbit.Application.DTOs.Registry
{
    public class DtoImageBuild
    {
        [Required]
        public string ImageName { get; set; } = string.Empty; // ex: "meu-app"

        [Required]
        public string Tag { get; set; } = "latest";

        [Required]
        public string BuildContextPath { get; set; } = string.Empty; // ex: "/srv/meu-projeto/codigo-fonte"

        public string DockerfilePath { get; set; } = "Dockerfile"; // Relativo ao BuildContextPath
    }
}
