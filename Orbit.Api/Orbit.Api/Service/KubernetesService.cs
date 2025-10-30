using k8s.Models;
using Orbit.Api.Dto.kubernetes;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class KubernetesService : IKubernetesService
    {
        private readonly IKubernetesRepository _repository;

        private V1Namespace BuildNamespaceObject(DtoNamespaceRequest request)
        {
            return new V1Namespace
            {
                Metadata = new k8s.Models.V1ObjectMeta
                {
                    Name = request.Name
                }
            };
        }

        private DtoNamespaceResponse MapToDto(V1Namespace createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }

            return new DtoNamespaceResponse
            {
                Name = createdEntity.Name(),
                Status = createdEntity.Status?.Phase
            };
        }

        public KubernetesService(IKubernetesRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DtoPod>> GetAllPodsAsync(string? namespaceName = null)
        {
            var pods = await _repository.ListPodsAsync(namespaceName);
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




        // Namespace
        public async Task<IEnumerable<DtoNamespaceResponse>> GetAllNamespacesAsync()
        {
            var namespaces = await _repository.ListNamespacesAsync();
            return namespaces.Select(n => new DtoNamespaceResponse
            {
                Name = n.Metadata.Name,
                Status = n.Status.Phase
            });
        }

        public async Task<DtoNamespaceResponse> CreateNamespaceAsync(DtoNamespaceRequest request)
        {
            var existing = await _repository.GetNamespaceAsync(request.Name);
            if (existing != null)
            {
                throw new Exception($"Namespace '{request.Name}' já existe.");
            }

            var newNs = BuildNamespaceObject(request);
            var created = await _repository.CreateNamespaceAsync(newNs);
            return MapToDto(created);
        }

        

        public async Task<DtoNamespaceResponse> GetNamespaceAsync(string name)
        {
            var ns = await _repository.GetNamespaceAsync(name);
            if (ns == null)
            {
                throw new Exception($"Namespace '{name}' não encontrado.");
            }
            return MapToDto(ns);
        }
        public async Task DeleteNamespaceAsync(string name)
        {
            var existing = await _repository.GetNamespaceAsync(name);
            if (existing == null)
            {
                throw new Exception($"Namespace '{name}' não encontrado.");
            }

            await _repository.DeleteNamespaceAsync(name);
        }
    }
}
