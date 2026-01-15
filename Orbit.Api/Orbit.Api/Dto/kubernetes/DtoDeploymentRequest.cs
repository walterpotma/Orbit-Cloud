using System.ComponentModel.DataAnnotations;

namespace Orbit.Api.Dto.kubernetes
{
    public class DtoDeploymentRequest
    {
        [Required(ErrorMessage = "O nome da aplicação é obrigatório.")]
        [RegularExpression(@"^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", ErrorMessage = "O nome deve conter apenas letras minúsculas, números e traços (Padrão DNS).")]
        [MinLength(3, ErrorMessage = "O nome deve ter no mínimo 3 caracteres.")]
        public string Name { get; set; } = string.Empty;

        // 2. Imagem Docker
        [Required(ErrorMessage = "A imagem é obrigatória.")]
        public string Image { get; set; } = string.Empty;

        public string Tag { get; set; } = "latest";

        // 3. Configuração
        [Range(1, 65535, ErrorMessage = "A porta deve estar entre 1 e 65535.")]
        public int Port { get; set; } = 80;

        [Range(1, 1, ErrorMessage = "O plano gratuito permite no máximo 1 réplicas.")]
        public int Replicas { get; set; } = 1;

        // 4. Rede (Opcional)
        // Se preenchido, cria o Ingress. Se nulo ou vazio, cria apenas interno.
        [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "O subdomínio deve conter apenas letras minúsculas e traços.")]
        public string? Subdomain { get; set; }
    }
}
