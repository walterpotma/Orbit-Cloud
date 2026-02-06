using k8s.Models;
using Orbit.Application.DTOs.kubernetes;
using Orbit.Application.Mappers;
using Orbit.Domain.Interfaces;
using Orbit.Application.Interfaces;
using YamlDotNet.Core.Tokens;

namespace Orbit.Infraestructure.Services
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

            // CORREÇÃO: Declaramos a variável AQUI FORA para ela existir no final do método
            V1Deployment createdEntity;

            try
            {
                createdEntity = await _repository.CreateDeploymentAsync(newDeployment, namespaces);
            }
            catch (Exception ex)
            {
                // Se falhar aqui, o throw encerra o método, então não tem risco de createdEntity ser usada nula lá embaixo
                throw new Exception($"Erro ao criar Deployment: {ex.Message}");
            }

            // 2. CRIA O SERVICE (A Rede Interna)
            var serviceRequest = new DtoServiceRequest
            {
                Name = request.Name,
                Port = 80,
                TargetPort = request.Port
            };

            try
            {
                await CreateServicesAsync(serviceRequest, namespaces);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar Service: {ex.Message}");
            }

            // 3. CRIA O INGRESS (A URL Pública)
            if (!string.IsNullOrWhiteSpace(request.Subdomain))
            {
                try
                {
                    // Ajuste do Host Completo (importante para funcionar)
                    string fullHost = $"{request.Subdomain}"; // Ajuste o domínio base se necessário

                    var ingressObj = _mapper.BuildIngressObject(new DtoIngressRequest
                    {
                        Name = request.Name,
                        Namespace = namespaces,
                        Host = fullHost,
                        IngressClassName = "nginx"
                    });

                    await _repository.CreateIngressAsync(ingressObj, namespaces);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao criar Ingress: {ex.Message}");
                }
            }

            // Agora o compilador consegue enxergar createdEntity!
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

            try
            {
                // Valores Padrão para novos Workspaces (Pode vir de um enum "Planos" futuramente)
                string defaultCpu = "500m";
                string defaultMem = "1024Mi";

                await _repository.CreateNamespaceQuotaAsync(request.Name, defaultCpu, defaultMem);
                Console.WriteLine($"[Info] Quota aplicada ao namespace {request.Name}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Erro] Falha ao aplicar quota: {ex.Message}");
                // Não impedimos a criação do namespace, apenas logamos o erro da quota
            }

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
            // ... (Código anterior de pegar métricas de pods continua igual) ...
            var rawMetrics = await _repository.GetPodMetricsAsync();

            // Agrupa métricas por namespace
            var grouped = rawMetrics.Items
                .GroupBy(m => m.Metadata.Namespace())
                .Select(g => new
                {
                    Name = g.Key,
                    Count = g.Count(),
                    TotalCpu = g.Sum(pod => pod.Containers.Sum(c => c.Usage["cpu"].ToDecimal())),
                    TotalMem = g.Sum(pod => pod.Containers.Sum(c => c.Usage["memory"].ToDecimal()))
                })
                .ToList();

            var resultList = new List<DtoNamespaceMetrics>();

            foreach (var g in grouped)
            {
                // 1. Busca a Quota do Namespace
                var quota = await _repository.GetNamespaceQuotaAsync(g.Name);

                decimal cpuLimit = 0;
                long memLimit = 0;

                // 2. Extrai os valores Hard (Limites definidos)
                if (quota?.Status?.Hard != null)
                {
                    if (quota.Status.Hard.TryGetValue("limits.cpu", out var qCpu))
                        cpuLimit = qCpu.ToDecimal();

                    if (quota.Status.Hard.TryGetValue("limits.memory", out var qMem))
                        memLimit = qMem.ToInt64();
                }

                // 3. Monta o DTO Completo
                resultList.Add(new DtoNamespaceMetrics
                {
                    Namespace = g.Name,
                    PodCount = g.Count,

                    // Uso
                    RawCpu = g.TotalCpu,
                    RawMemory = (long)g.TotalMem,
                    CpuUsage = FormatCpu(g.TotalCpu),
                    MemoryUsage = FormatMemory((long)g.TotalMem),

                    // Limites (Novos Campos)
                    RawCpuLimit = cpuLimit,
                    RawMemoryLimit = memLimit,
                    CpuLimit = cpuLimit > 0 ? FormatCpu(cpuLimit) : "∞", // Infinito se não tiver quota
                    MemoryLimit = memLimit > 0 ? FormatMemory(memLimit) : "∞"
                });
            }

            return resultList.OrderByDescending(x => x.RawMemory).ToList();
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
