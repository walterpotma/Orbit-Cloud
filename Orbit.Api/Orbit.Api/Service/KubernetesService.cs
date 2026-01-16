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
        public async Task<List<DtoDeploymentResponse>> GetAllDeploymentsAsync(string? namespaces)
        {
            var k8sDeployments = await _repository.GetDeploymentsAsync(namespaces);

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
        public async Task<DtoDeploymentResponse> CreateDeploymentAsync(DtoDeploymentRequest request, string namespaces)
        {
            // 1. CRIA O DEPLOYMENT (O App em si)
            var newDeployment = _mapper.BuildDeploymentObject(request, namespaces);
            var createdEntity = await _repository.CreateDeploymentAsync(newDeployment, namespaces);

            // 2. CRIA O SERVICE (A Rede Interna) - Essencial para o Ingress funcionar depois
            var serviceRequest = new DtoServiceRequest
            {
                Name = request.Name,
                Port = 80, // Porta padrão do cluster
                TargetPort = request.Port // Porta que o app roda (ex: 3000)
            };

            // Usamos try/catch para garantir que, se a rede falhar, o deploy não quebra totalmente
            try
            {
                await CreateServicesAsync(serviceRequest, namespaces);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar Service: {ex.Message}");
                // Decisão de projeto: O Deploy continua, mas sem rede.
            }

            // 3. CRIA O INGRESS (A URL Pública) - Opcional
            // Só cria se o usuário mandou um subdomínio no Front
            if (!string.IsNullOrWhiteSpace(request.Subdomain))
            {
                try
                {
                    var ingressRequest = new DtoIngressRequest
                    {
                        Name = request.Name,
                        Namespace = namespaces,
                        // Aqui assumimos que o host é subdomain + seu dominio
                        // Você pode ajustar isso no Mapper ou passar o host completo aqui
                    };

                    // Você precisará adaptar seu CreateIngressAsync para aceitar o DTO ou criar o objeto aqui
                    // await CreateIngressAsync(ingressRequest, namespaces); 

                    // OU, se seu método CreateIngressAsync já espera o objeto pronto:
                    var ingressObj = _mapper.BuildIngressObject(new DtoIngressRequest
                    {
                        Name = request.Name,
                        Namespace = namespaces,
                        Host = request.Subdomain,
                        // ... preencher o host ...
                    });
                    await _repository.CreateIngressAsync(ingressObj, namespaces);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao criar Ingress: {ex.Message}");
                }
            }

            // Retorna o sucesso do Deploy
            return _mapper.MapToDtoDeployment(createdEntity);
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
                CreationTimestamp = s.Metadata.CreationTimestamp,
                IngressClassName = s.Spec.IngressClassName,

                // AQUI ESTÁ A MÁGICA: Navegamos no objeto do Kubernetes para pegar o Host
                Rules = s.Spec.Rules?.Select(r => new DtoIngressRuleResponse
                {
                    Host = r.Host, // O endereço que você quer (ex: sub.dominio.com)

                    // Opcional: Pega para qual service ele aponta (útil para debug)
                    ServiceName = r.Http?.Paths?.FirstOrDefault()?.Backend?.Service?.Name,
                    ServicePort = r.Http?.Paths?.FirstOrDefault()?.Backend?.Service?.Port?.Number ?? 0
                }).ToList()
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

        public async Task<List<DtoNamespaceMetrics>> GetNamespaceMetricsAsync()
        {
            try
            {
                // 1. Busca dados brutos no Repo
                var rawMetrics = await _repository.GetPodMetricsAsync();

                // 2. Agrupa e Soma (Lógica de Negócio)
                var grouped = rawMetrics.Items
                    .GroupBy(m => m.Metadata.Namespace()) // Use .Namespace() com parênteses se for extensão
                    .Select(g => new
                    {
                        Name = g.Key,
                        Count = g.Count(),
                        // Soma a CPU de todos os containers de todos os pods desse namespace
                        TotalCpu = g.Sum(pod => pod.Containers.Sum(c => c.Usage["cpu"].ToDecimal())),
                        // Soma a Memória
                        TotalMem = g.Sum(pod => pod.Containers.Sum(c => c.Usage["memory"].ToDecimal()))
                    })
                    .ToList();

                // 3. Mapeia para DTO e Formata
                return grouped.Select(g => new DtoNamespaceMetrics
                {
                    Namespace = g.Name,
                    PodCount = g.Count,
                    RawCpu = g.TotalCpu,
                    RawMemory = (long)g.TotalMem,
                    CpuUsage = FormatCpu(g.TotalCpu),
                    MemoryUsage = FormatMemory((long)g.TotalMem)
                })
                .OrderByDescending(x => x.RawMemory) // Ordena por quem gasta mais RAM
                .ToList();
            }
            catch (Exception ex)
            {
                // Se o Metrics Server não estiver instalado no cluster, isso vai dar erro.
                // Logar e retornar lista vazia é uma boa prática para não quebrar o dashboard.
                Console.WriteLine($"Erro metrics: {ex.Message}");
                return new List<DtoNamespaceMetrics>();
            }
        }

        public async Task<DtoNamespaceMetrics> GetByNamespaceMetricsAsync(string namespaced)
        {
            var allMetrics = await GetNamespaceMetricsAsync();
            return allMetrics.FirstOrDefault(m => m.Namespace == namespaced);
        }

        // --- Helpers Privados de Formatação ---

        private string FormatCpu(decimal value)
        {
            // O K8s retorna CPU em cores decimais. 0.1 = 100m (millicores)
            if (value < 1)
                return $"{(value * 1000):0}m";
            return $"{value:0.0} cpu";
        }

        private string FormatMemory(long bytes)
        {
            // 1 MiB = 1024 * 1024 bytes
            double mb = bytes / (1024.0 * 1024.0);

            if (mb > 1024)
                return $"{(mb / 1024.0):0.00} GiB";

            return $"{mb:0} MiB";
        }
        #endregion
    }
}
