using k8s.Models;
using Orbit.Api.Dto.kubernetes;
using Orbit.Api.Mappers;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;
using YamlDotNet.Core.Tokens;

namespace Orbit.Api.Service
{
    public class KubernetesService : IKubernetesService
    {
        private readonly IKubernetesRepository _repository;
        private readonly MapperKubernetes _mapper;

        public KubernetesService(IKubernetesRepository repository, MapperKubernetes mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        #region Kubernetes Deployments
        public async Task<List<DtoDeploymentResponse>> GetAllDeploymentsAsync()
        {
            var k8sDeployments = await _repository.GetDeploymentsAsync();

            var result = k8sDeployments.Items.Select(d =>
            {
                // 1. Pega o primeiro container da lista (geralmente é o principal)
                var container = d.Spec.Template.Spec.Containers.FirstOrDefault();

                // 2. Pega a string da imagem (ou "-" se não achar)
                string fullImage = container?.Image ?? "-";

                // 3. Tenta extrair só a tag (tudo depois do último ":")
                string tag = "latest";
                if (fullImage.Contains(":"))
                {
                    tag = fullImage.Split(':').Last();
                }

                return new DtoDeploymentResponse
                {
                    Name = d.Metadata.Name,
                    Namespace = d.Metadata.Namespace(), // Lembra dos parênteses!
                    ReplicasDesired = d.Status.Replicas ?? 0,
                    ReplicasReady = d.Status.ReadyReplicas ?? 0,
                    Status = (d.Status.ReadyReplicas >= d.Status.Replicas) ? "Running" : "Pending",

                    Age = d.Metadata.CreationTimestamp.HasValue
                          ? (DateTime.UtcNow - d.Metadata.CreationTimestamp.Value).Days + "d"
                          : "-",

                    // NOVOS CAMPOS PREENCHIDOS
                    Image = fullImage,
                    ImageTag = tag
                };
            })
            .Where(d => d.Namespace != "kube-system" && d.Namespace != "kube-public") // Filtro de sistema
            .ToList();

            return result;
        }
        #endregion

        #region Kubernetes Pods
        public async Task<IEnumerable<DtoPodResponse>> GetAllPodsAsync(string? namespaces = null)
        {
            var pods = await _repository.ListPodsAsync(namespaces);
            return pods.Select(p => new DtoPodResponse
            {
                Name = p.Metadata.Name,
                Namespace = p.Metadata.NamespaceProperty,
                Status = p.Status.Phase,
                CreationTimestamp = p.Metadata.CreationTimestamp
            });
        }
        public async Task<DtoPodResponse> GetPodsAsync(string name, string namespaces)
        {
            var response = await _repository.GetPodsAsync(name, namespaces);
            if (response == null)
            {
                return null;
            }
            return _mapper.MapToDtoPod(response);
        }
        public async Task DeletePodsAsync(string name, string namespaces)
        {
            await _repository.DeletePodsAsync(name, namespaces);
        }
        #endregion

        #region Kubernetes Service
        public async Task<IEnumerable<DtoServiceResponse>> GetAllServicesAsync(string? namespaces = null)
        {
            var services = await _repository.ListServicesAsync(namespaces);
            return services.Select(s => new DtoServiceResponse
            {
                Name = s.Metadata.Name,
                Namespace = s.Metadata.NamespaceProperty,
                Type = s.Spec.Type,
                ClusterIp = s.Spec.ClusterIP,
            });
        }
        public async Task<DtoServiceResponse> GetServicesAsync(string name, string namespaces)
        {
            var response = await _repository.GetServicesAsync(name, namespaces);
            if (response == null)
            {
                return null;
            }
            return _mapper.MapToDtoService(response);
        }
        public async Task<DtoServiceResponse> CreateServicesAsync(DtoServiceRequest request, string namespaces)
        {
            var existing = await _repository.GetServicesAsync(request.Name, namespaces);
            if (existing != null)
            {
                throw new Exception($"Service '{request.Name}' já existe.");
            }

            var newServices = _mapper.BuildServiceObject(request);
            var created = await _repository.CreateServicesAsync(newServices, namespaces);
            return _mapper.MapToDtoService(created);
        }
        public async Task DeleteServicesAsync(string name, string namespaces)
        {
            await _repository.DeleteServicesAsync(name, namespaces);
        }
        #endregion

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
            return _mapper.MapToDtoIngress(reponse);
        }
        public async Task<DtoIngressResponse> CreateIngressAsync(DtoIngressRequest request, string namespaces)
        {
            var existing = await _repository.GetIngressAsync(request.Name, namespaces);
            if (existing != null)
            {
                throw new Exception($"Ingress '{request.Name}' já existe.");
            }

            var newIngress = _mapper.BuildIngressObject(request);
            var created = await _repository.CreateIngressAsync(newIngress, namespaces);
            return _mapper.MapToDtoIngress(created);
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
            return _mapper.MapToDtoSecret(secret);
        }
        public async Task<DtoSecretResponse> CreateSecretsAsync(DtoSecretRequest request, string namespaces)
        {
            var existing = await _repository.GetSecretsAsync(request.Name, namespaces);
            if (existing != null)
            {
                throw new Exception($"Secret '{request.Name}' já existe.");
            }

            var newSecret = _mapper.BuildSecretObject(request);
            var created = await _repository.CreateSecretsAsync(newSecret, namespaces);
            return _mapper.MapToDtoSecret(created);
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
            return _mapper.MapToDtoNamespace(response);
        }
        public async Task<DtoNamespaceResponse> CreateNamespacesAsync(DtoNamespaceRequest request)
        {
            var existing = await _repository.GetNamespacesAsync(request.Name);
            if (existing != null)
            {
                throw new Exception($"Namespace '{request.Name}' já existe.");
            }

            var newNs = _mapper.BuildNamespaceObject(request);
            var created = await _repository.CreateNamespacesAsync(newNs);
            return _mapper.MapToDtoNamespace(created);
        }
        public async Task DeleteNamespacesAsync(string name)
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
