using System.ComponentModel.DataAnnotations;

namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoNamespaceRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
