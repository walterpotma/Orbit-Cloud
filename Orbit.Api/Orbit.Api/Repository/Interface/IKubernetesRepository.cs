using k8s.Models;

namespace Orbit.Api.Repository.Interface
{
    public interface IKubernetesRepository
    {
        Task<IEnumerable<V1Pod>> ListPodsAsync(string? namespaceName = null);
        Task<IEnumerable<V1Service>> ListServicesAsync(string? namespaceName = null);
        Task<IEnumerable<V1Ingress>> ListIngressesAsync(string? namespaceName = null);
        Task<IEnumerable<V1Secret>> ListSecretsAsync(string? namespaceName = null);
        Task<IEnumerable<V1Namespace>> ListNamespacesAsync();
    }
}
