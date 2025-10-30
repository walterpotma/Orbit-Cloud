using System.ComponentModel.DataAnnotations;

namespace Orbit.Api.Dto.kubernetes
{
    public class DtoNamespaceRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
