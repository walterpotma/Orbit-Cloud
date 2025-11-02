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

        private V1Secret BuildSecretObject(DtoSecretRequest request)
        {
            return new V1Secret
            {
                ApiVersion = "v1",
                Kind = "Secret",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    NamespaceProperty = request.Namespace ?? "default"
                },
                Type = "Opaque",
                StringData = request.Data
            };
        }
        private DtoSecretResponse MapToDtoSecret(V1Secret createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }

            return new DtoSecretResponse
            {
                Name = createdEntity.Name(),
                Namespace = createdEntity.Namespace(),
                Type = createdEntity.Type,
                CreationTimestamp = createdEntity.Metadata.CreationTimestamp,
                Keys = createdEntity.Data?.Keys
            };
        }

        private V1Ingress BuildIngressObject(DtoIngressRequest request)
        {
            return new V1Ingress
            {
                ApiVersion = "v1",
                Kind = "Ingress",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    NamespaceProperty = request.Namespace ?? "default",
                    Annotations = new Dictionary<string, string>
                    {
                        { "kubernetes.io/ingress.class", request.IngressClassName ?? "nginx" }
                    }
                },
            };
        }
        private DtoIngressResponse MapToDtoIngress(V1Ingress createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }

            return new DtoIngressResponse
            {
                Name = createdEntity.Name(),
                Namespace = createdEntity.Namespace()
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

        #region Kubernetes Ingress
        public async Task<IEnumerable<DtoIngressResponse>> GetAllIngressAsync(string? namespaces = null)
        {
            var reponse = await _repository.ListIngressAsync(namespaces);
            return reponse.Select(s => new DtoIngressResponse
            {
                Name = s.Metadata.Name,
                Namespace = s.Metadata.NamespaceProperty,
            });
        }
        public async Task<DtoIngressResponse> GetIngressAsync(string name, string namespaces)
        {
            var reponse = await _repository.GetIngressAsync(name, namespaces);
            if (reponse == null)
            {
                return null;
            }
            return MapToDtoIngress(reponse);
        }
        public async Task<DtoIngressResponse> CreateIngressAsync(DtoIngressRequest request, string namespaces)
        {
            var existing = await _repository.GetIngressAsync(request.Name, namespaces);
            if (existing != null)
            {
                throw new Exception($"Ingress '{request.Name}' já existe.");
            }

            var newIngress = BuildIngressObject(request);
            var created = await _repository.CreateIngressAsync(newIngress, namespaces);
            return MapToDtoIngress(created);
        }
        public async Task DeleteIngressAsync(string name, string namespaces)
        {
            await _repository.DeleteIngressAsync(name, namespaces);
        }
        #endregion

        #region Kubernetes Secret
        public async Task<IEnumerable<DtoSecretResponse>> GetAllSecretsAsync(string? namespaces = null)
        {
            var secrets = await _repository.ListSecretsAsync(namespaces);
            return secrets.Select(s => new DtoSecretResponse
            {
                Name = s.Metadata.Name,
                Namespace = s.Metadata.NamespaceProperty,
                Type = s.Type,
                Keys = s.Data?.Keys,
                CreationTimestamp = s.Metadata.CreationTimestamp
            });
        }
        public async Task<DtoSecretResponse> GetSecretsAsync(string name, string namespaces)
        {
            var secret = await _repository.GetSecretsAsync(name, namespaces);
            if (secret == null)
            {
                return null;
            }
            return MapToDtoSecret(secret);
        }
        public async Task<DtoSecretResponse> CreateSecretsAsync(DtoSecretRequest request, string namespaces)
        {
            var existing = await _repository.GetSecretsAsync(request.Name, namespaces);
            if (existing != null)
            {
                throw new Exception($"Secret '{request.Name}' já existe.");
            }

            var newSecret = BuildSecretObject(request);
            var created = await _repository.CreateSecretsAsync(newSecret, namespaces);
            return MapToDtoSecret(created);
        }
        public async Task DeleteSecretsAsync(string name, string namespaces)
        {
            await _repository.DeleteSecretsAsync(name, namespaces);
        }
        #endregion

        #region Kubernetes Namespace
        public async Task<IEnumerable<DtoNamespaceResponse>> GetAllNamespacesAsync()
        {
            var response = await _repository.ListNamespacesAsync();
            return response.Select(n => new DtoNamespaceResponse
            {
                Name = n.Metadata.Name,
                Status = n.Status.Phase
            });
        }
        public async Task<DtoNamespaceResponse> GetNamespacesAsync(string name)
        {
            var response = await _repository.GetNamespacesAsync(name);
            if (response == null)
            {
                throw new Exception($"Namespace '{name}' não encontrado.");
            }
            return MapToDto(response);
        }
        public async Task<DtoNamespaceResponse> CreateNamespacesAsync(DtoNamespaceRequest request)
        {
            var existing = await _repository.GetNamespacesAsync(request.Name);
            if (existing != null)
            {
                throw new Exception($"Namespace '{request.Name}' já existe.");
            }

            var newNs = BuildNamespaceObject(request);
            var created = await _repository.CreateNamespacesAsync(newNs);
            return MapToDto(created);
        }
        public async Task DeleteNamespaceAsync(string name)
        {
            var existing = await _repository.GetNamespacesAsync(name);
            if (existing == null)
            {
                throw new Exception($"Namespace '{name}' não encontrado.");
            }

            await _repository.DeleteNamespacesAsync(name);
        }
        #endregion
    }
}
