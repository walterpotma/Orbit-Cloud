using k8s.Models;

namespace Orbit.Api.Repository.Interface
{
    public interface IKubernetesRepository
    {
        Task<IEnumerable<V1Pod>> ListPodsAsync(string? namespaceName = null);
        Task<IEnumerable<V1Service>> ListServicesAsync(string? namespaceName = null);

        #region Kubernetes Ingress
        Task<IEnumerable<V1Ingress>> ListIngressAsync(string? namespaceName = null);
        Task<V1Ingress> GetIngressAsync(string name, string namespaces);
        Task<V1Ingress> CreateIngressAsync(V1Ingress ingress, string namespaces);
        Task DeleteIngressAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Secret
        Task<IEnumerable<V1Secret>> ListSecretsAsync(string? namespaces = null);
        Task<V1Secret> GetSecretsAsync(string name, string namespaces);
        Task<V1Secret> CreateSecretsAsync(V1Secret secret, string namespaces);
        Task DeleteSecretsAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Namespace
        Task<IEnumerable<V1Namespace>> ListNamespacesAsync();
        Task<V1Namespace> GetNamespaceAsync(string name);
        Task<V1Namespace> CreateNamespaceAsync(V1Namespace ns);
        Task DeleteNamespaceAsync(string name);
        #endregion
    }
}
