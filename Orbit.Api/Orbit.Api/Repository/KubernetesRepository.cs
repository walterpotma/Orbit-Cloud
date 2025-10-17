using k8s;
using k8s.Models;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class KubernetesRepository : IKubernetesRepository
    {
        private readonly IKubernetes _kubernetesClient;

        public KubernetesRepository(IKubernetes kubernetesClient)
        {
            _kubernetesClient = kubernetesClient;
        }

        public async Task<IEnumerable<V1Pod>> ListPodsAsync(string? namespaceName = null)
        {
            var pods = string.IsNullOrEmpty(namespaceName)
                ? await _kubernetesClient.CoreV1.ListPodForAllNamespacesAsync()
                : await _kubernetesClient.CoreV1.ListNamespacedPodAsync(namespaceName);
            return pods.Items;
        }

        public async Task<IEnumerable<V1Service>> ListServicesAsync(string? namespaceName = null)
        {
            var services = string.IsNullOrEmpty(namespaceName)
                ? await _kubernetesClient.CoreV1.ListServiceForAllNamespacesAsync()
                : await _kubernetesClient.CoreV1.ListNamespacedServiceAsync(namespaceName);
            return services.Items;
        }

        public async Task<IEnumerable<V1Ingress>> ListIngressesAsync(string? namespaceName = null)
        {
            var ingresses = string.IsNullOrEmpty(namespaceName)
                ? await _kubernetesClient.NetworkingV1.ListIngressForAllNamespacesAsync()
                : await _kubernetesClient.NetworkingV1.ListNamespacedIngressAsync(namespaceName);
            return ingresses.Items;
        }

        public async Task<IEnumerable<V1Secret>> ListSecretsAsync(string? namespaceName = null)
        {
            var secrets = string.IsNullOrEmpty(namespaceName)
                ? await _kubernetesClient.CoreV1.ListSecretForAllNamespacesAsync()
                : await _kubernetesClient.CoreV1.ListNamespacedSecretAsync(namespaceName);
            return secrets.Items;
        }

        public async Task<IEnumerable<V1Namespace>> ListNamespacesAsync()
        {
            var namespaces = await _kubernetesClient.CoreV1.ListNamespaceAsync();
            return namespaces.Items;
        }
    }
}
