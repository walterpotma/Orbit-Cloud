using k8s.Models;

namespace Orbit.Api.Repository.Interface
{
    public interface IKubernetesRepository
    {
        Task<IEnumerable<V1Pod>> ListPodsAsync(string? namespaceName = null);
        Task<IEnumerable<V1Service>> ListServicesAsync(string? namespaceName = null);
        Task<IEnumerable<V1Ingress>> ListIngressesAsync(string? namespaceName = null);
        Task<IEnumerable<V1Secret>> ListSecretsAsync(string? namespaceName = null);



        // Interface para o Namespace
        Task<IEnumerable<V1Namespace>> ListNamespacesAsync();
        Task<V1Namespace> GetNamespaceAsync(string name);
        Task<V1Namespace> CreateNamespaceAsync(V1Namespace ns);
        Task DeleteNamespaceAsync(string name);
    }
}
