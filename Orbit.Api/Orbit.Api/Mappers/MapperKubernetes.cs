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
        public DtoIngressResponse MapToDtoIngress(V1Ingress createdEntity)
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


        public V1Service BuildServiceObject(DtoServiceRequest request)
        {
            return new V1Service
            {
                ApiVersion = "v1",
                Kind = "Service",
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
    }
}
