using k8s.Models;
using Orbit.Api.Dto.kubernetes;

namespace Orbit.Api.Mappers
{
    public class MapperKubernetes
    {
        public V1Namespace BuildNamespaceObject(DtoNamespaceRequest request)
        {
            return new V1Namespace
            {
                Metadata = new k8s.Models.V1ObjectMeta
                {
                    Name = request.Name
                }
            };
        }

        public DtoNamespaceResponse MapToDtoNamespace(V1Namespace createdEntity)
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

        public V1Secret BuildSecretObject(DtoSecretRequest request)
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
        public DtoSecretResponse MapToDtoSecret(V1Secret createdEntity)
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

        public V1Ingress BuildIngressObject(DtoIngressRequest request)
        {
            return new V1Ingress
            {
                // 1. CORREÇÃO DA VERSÃO (Crucial)
                // De: "v1" -> Para: "networking.k8s.io/v1"
                ApiVersion = "networking.k8s.io/v1",
                Kind = "Ingress",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    NamespaceProperty = request.Namespace ?? "default",
                    Annotations = new Dictionary<string, string>
            {
                // Define o Nginx como controlador
                { "kubernetes.io/ingress.class", request.IngressClassName ?? "nginx" }
            }
                },
                // 2. ADIÇÃO DO SPEC (As regras de roteamento)
                Spec = new V1IngressSpec
                {
                    Rules = new List<V1IngressRule>
            {
                new V1IngressRule
                {
                    // Define o domínio (ex: meupp.orbitcloud.com.br)
                    // Se o DTO não tiver o host completo, montamos aqui
                    Host = $"{request.Host}.crion.dev",
                    Http = new V1HTTPIngressRuleValue
                    {
                        Paths = new List<V1HTTPIngressPath>
                        {
                            new V1HTTPIngressPath
                            {
                                Path = "/",
                                PathType = "Prefix",
                                Backend = new V1IngressBackend
                                {
                                    Service = new V1IngressServiceBackend
                                    {
                                        Name = request.Name, // Nome do Service que criamos antes
                                        Port = new V1ServiceBackendPort { Number = 80 } // Porta do Service
                                    }
                                }
                            }
                        }
                    }
                }
            }
                }
            };
        }
        public DtoIngressResponse MapToDtoIngress(V1Ingress entity)
        {
            if (entity == null) return null;

            return new DtoIngressResponse
            {
                Name = entity.Metadata.Name,
                Namespace = entity.Metadata.NamespaceProperty,
                CreationTimestamp = entity.Metadata.CreationTimestamp,
                IngressClassName = entity.Spec?.IngressClassName,

                // Mesma lógica do Service
                Rules = entity.Spec?.Rules?.Select(r => new DtoIngressRuleResponse
                {
                    Host = r.Host,
                    ServiceName = r.Http?.Paths?.FirstOrDefault()?.Backend?.Service?.Name,
                    ServicePort = r.Http?.Paths?.FirstOrDefault()?.Backend?.Service?.Port?.Number ?? 0
                }).ToList()
            };
        }


        public V1Service BuildServiceObject(DtoServiceRequest request)
        {
            return new V1Service
            {
                ApiVersion = "v1",
                Kind = "Service",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    // As Labels ajudam na organização visual
                    Labels = new Dictionary<string, string>
            {
                { "app", request.Name }
            }
                },
                Spec = new V1ServiceSpec
                {
                    // ⚠️ CRÍTICO: O Selector diz "Mande tráfego para os Pods que tenham a label app=nome".
                    // Se isso não bater com o Deployment, o Service funciona mas não acha ninguém (Endpoints = <none>)
                    Selector = new Dictionary<string, string>
            {
                { "app", request.Name }
            },
                    Ports = new List<V1ServicePort>
            {
                new V1ServicePort
                {
                    Name = "http",
                    Protocol = "TCP",
                    Port = request.Port, // A porta do Service (ex: 80)
                    // A porta real do container. Se for nula, usa a mesma do Service.
                    TargetPort = request.TargetPort ?? request.Port
                }
            },
                    // Define se é interno (ClusterIP) ou externo via nó (NodePort). Padrão é ClusterIP.
                    Type = request.Type ?? "ClusterIP"
                }
            };
        }
        public DtoServiceResponse MapToDtoService(V1Service createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }

            return new DtoServiceResponse
            {
                Name = createdEntity.Name(),
                Namespace = createdEntity.Namespace()
            };
        }

        public DtoPodResponse MapToDtoPod(V1Pod createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }

            return new DtoPodResponse
            {
                Name = createdEntity.Name(),
                Namespace = createdEntity.Namespace()
            };
        }
        public DtoDeploymentResponse MapToDtoDeployment(V1Deployment createdEntity)
        {
            if (createdEntity == null)
            {
                return null;
            }
            return new DtoDeploymentResponse
            {
                Name = createdEntity.Name(),
                Namespace = createdEntity.Namespace()
            };
        }
        public V1Deployment BuildDeploymentObject(DtoDeploymentRequest request, string namespaces)
        {
            // Labels são essenciais para o Service encontrar o Pod depois
            var labels = new Dictionary<string, string>
    {
        { "app", request.Name }
    };

            return new V1Deployment
            {
                ApiVersion = "apps/v1",
                Kind = "Deployment",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    NamespaceProperty = namespaces,
                    Labels = labels
                },
                Spec = new V1DeploymentSpec
                {
                    Replicas = request.Replicas, // Vem do DTO
                    Selector = new V1LabelSelector
                    {
                        MatchLabels = labels
                    },
                    Template = new V1PodTemplateSpec
                    {
                        Metadata = new V1ObjectMeta
                        {
                            Labels = labels
                        },
                        Spec = new V1PodSpec
                        {
                            Containers = new List<V1Container>
                    {
                        new V1Container
                        {
                            Name = request.Name,
                            Image = request.Image + ":" + (request.Tag ?? "latest"),
                            Ports = new List<V1ContainerPort>
                            {
                                new V1ContainerPort { ContainerPort = request.Port }
                            },
                            // Define limite de recursos (opcional mas recomendado)
                            //Resources = new V1ResourceRequirements
                            //{
                            //    Requests = new Dictionary<string, ResourceQuantity>
                            //    {
                            //        { "memory", new ResourceQuantity("128Mi") },
                            //        { "cpu", new ResourceQuantity("100m") }
                            //    }
                            //}
                        }
                    }
                        }
                    }
                }
            };
        }
    }
}
