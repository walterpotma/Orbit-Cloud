using k8s.Models;
using Orbit.Api.Dto.kubertnetes;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class DeployService : IDeployService
    {
        private readonly IDeployRepository _deployRepository;

        public DeployService(IDeployRepository deployRepository)
        {
            _deployRepository = deployRepository;
        }

        // Este método agora satisfaz o contrato da interface
        public async Task<DtoDeployment> CreateOrUpdateDeploymentAsync(DtoDeployRequest request)
        {
            var existingDeployment = await _deployRepository.GetDeploymentAsync(request.Name, request.Namespace);

            V1Deployment deploymentToSave;

            if (existingDeployment == null)
            {
                deploymentToSave = BuildNewDeploymentObject(request);
                var created = await _deployRepository.CreateDeploymentAsync(deploymentToSave);
                return MapToDto(created);
            }
            else
            {
                deploymentToSave = UpdateExistingDeploymentObject(existingDeployment, request);
                var updated = await _deployRepository.UpdateDeploymentAsync(deploymentToSave);
                return MapToDto(updated);
            }
        }
        private V1Deployment BuildNewDeploymentObject(DtoDeployRequest request)
        {
            var labels = new Dictionary<string, string> { { "app", request.Name } };

            return new V1Deployment
            {
                ApiVersion = "apps/v1",
                Kind = "Deployment",
                Metadata = new V1ObjectMeta
                {
                    Name = request.Name,
                    NamespaceProperty = request.Namespace,
                    Labels = labels
                },
                Spec = new V1DeploymentSpec
                {
                    Replicas = request.Replicas,
                    Selector = new V1LabelSelector { MatchLabels = labels },
                    Template = new V1PodTemplateSpec
                    {
                        Metadata = new V1ObjectMeta { Labels = labels },
                        Spec = new V1PodSpec
                        {
                            Containers = new List<V1Container>
                        {
                            new V1Container
                            {
                                Name = request.Name, // O nome do container
                                Image = request.Image, // A imagem a ser usada
                                Ports = new List<V1ContainerPort>
                                {
                                    new V1ContainerPort(request.ContainerPort)
                                }
                            }
                        }
                        }
                    }
                }
            };
        }

        private V1Deployment UpdateExistingDeploymentObject(V1Deployment existing, DtoDeployRequest request)
        {
            // Atualiza apenas os campos que queremos mudar
            existing.Spec.Replicas = request.Replicas;
            existing.Spec.Template.Spec.Containers[0].Image = request.Image;
            existing.Spec.Template.Spec.Containers[0].Ports[0].ContainerPort = request.ContainerPort;

            return existing;
        }

        private DtoDeployment MapToDto(V1Deployment dep)
        {
            return new DtoDeployment
            {
                Name = dep.Metadata.Name,
                Namespace = dep.Metadata.NamespaceProperty,
                Replicas = dep.Spec.Replicas ?? 0,
                Image = dep.Spec.Template.Spec.Containers.FirstOrDefault()?.Image ?? "unknown",
                Status = dep.Status.Conditions.FirstOrDefault(c => c.Status == "True")?.Type ?? "Processing",
                CreationTimestamp = dep.Metadata.CreationTimestamp
            };
        }
    }
}
