using Orbit.Api.Dto.kubertnetes;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class KubernetesService : IKubernetesService
    {
        private readonly IKubernetesRepository _repository;

        public KubernetesService(IKubernetesRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DtoPod>> GetAllPodsAsync(string? namespaceName = null)
        {
            var pods = await _repository.ListPodsAsync(namespaceName);
            // Mapeando do modelo do k8s para o nosso DTO
            return pods.Select(p => new DtoPod
            {
                Name = p.Metadata.Name,
                Namespace = p.Metadata.NamespaceProperty,
                Status = p.Status.Phase,
                IpAddress = p.Status.PodIP,
                CreationTimestamp = p.Metadata.CreationTimestamp
            });
        }



        public async Task<IEnumerable<DtoService>> GetAllServicesAsync(string? namespaceName = null)
        {
            var services = await _repository.ListServicesAsync(namespaceName);
            return services.Select(s => new DtoService
            {
                Name = s.Metadata.Name,
                Namespace = s.Metadata.NamespaceProperty,
                Type = s.Spec.Type,
                ClusterIp = s.Spec.ClusterIP,
                Ports = s.Spec.Ports?.Select(p => $"{p.Port}:{p.TargetPort}/{p.Protocol}") ?? Enumerable.Empty<string>()
            });
        }

        public async Task<IEnumerable<DtoIngress>> GetAllIngressesAsync(string? namespaceName = null)
        {
            var ingresses = await _repository.ListIngressesAsync(namespaceName);
            return ingresses.Select(i => new DtoIngress
            {
                Name = i.Metadata.Name,
                Namespace = i.Metadata.NamespaceProperty,
                Hosts = i.Spec.Rules?.Select(r => r.Host) ?? Enumerable.Empty<string>()
            });
        }

        public async Task<IEnumerable<DtoSecret>> GetAllSecretsAsync(string? namespaceName = null)
        {
            var secrets = await _repository.ListSecretsAsync(namespaceName);
            return secrets.Select(s => new DtoSecret
            {
                Name = s.Metadata.Name,
                Namespace = s.Metadata.NamespaceProperty,
                Type = s.Type
            });
        }

        public async Task<IEnumerable<DtoNamespace>> GetAllNamespacesAsync()
        {
            var namespaces = await _repository.ListNamespacesAsync();
            return namespaces.Select(n => new DtoNamespace
            {
                Name = n.Metadata.Name,
                Status = n.Status.Phase
            });
        }
    }
}
