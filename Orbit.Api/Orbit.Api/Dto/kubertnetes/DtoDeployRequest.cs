using System.ComponentModel.DataAnnotations;

namespace Orbit.Api.Dto.kubertnetes
{
    public class DtoDeployRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Namespace { get; set; } = string.Empty;

        [Required]
        public string Image { get; set; } = string.Empty;

        // Opcional, com um valor padrão
        public int Replicas { get; set; } = 1;

        // Opcional, para expor uma porta no container
        public int ContainerPort { get; set; } = 8080;
    }
}
