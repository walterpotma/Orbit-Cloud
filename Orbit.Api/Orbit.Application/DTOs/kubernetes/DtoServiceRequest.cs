using System.ComponentModel.DataAnnotations;

namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoServiceRequest
    {
        // 1. Identificação
        [Required(ErrorMessage = "O nome do serviço é obrigatório.")]
        [RegularExpression(@"^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", ErrorMessage = "O nome deve conter apenas letras minúsculas e traços.")]
        public string Name { get; set; } = string.Empty;

        // O Namespace geralmente vem da URL (route param), mas pode deixar aqui opcional se preferir
        public string? Namespace { get; set; }

        // 2. Portas (O Coração do Service)

        // Porta que o Serviço vai expor dentro do Cluster (Geralmente 80)
        [Range(1, 65535, ErrorMessage = "Porta inválida.")]
        public int Port { get; set; } = 80;

        // Porta que a sua aplicação (Container) está rodando de verdade (Ex: 3000 no Node, 5000 no .NET, 80 no Nginx)
        // Se não for informado, assumimos que é igual à Port.
        [Range(1, 65535, ErrorMessage = "TargetPort inválida.")]
        public int? TargetPort { get; set; }

        // 3. Configuração (Opcional)

        // ClusterIP (Padrão, Interno) ou NodePort (Externo s/ Ingress)
        public string Type { get; set; } = "ClusterIP";
    }
}