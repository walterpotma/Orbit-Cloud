using k8s;
using k8s.Models;
using Orbit.Api.Repository.Interface;
using System.Xml.Linq;

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


        #region Kubernetes Ingress
        public async Task<IEnumerable<V1Ingress>> ListIngressAsync(string? namespaceName = null)
        {
            var ingresses = string.IsNullOrEmpty(namespaceName)
                ? await _kubernetesClient.NetworkingV1.ListIngressForAllNamespacesAsync()
                : await _kubernetesClient.NetworkingV1.ListNamespacedIngressAsync(namespaceName);
            return ingresses.Items;
        }
        public async Task<V1Ingress> GetIngressAsync(string name, string namespaces)
        {
            try
            {
                return await _kubernetesClient.NetworkingV1.ReadNamespacedIngressAsync(name, namespaces);
            }
            catch (k8s.Autorest.HttpOperationException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }
        public async Task<V1Ingress> CreateIngressAsync(V1Ingress ingress, string namespaces)
        {
            return await _kubernetesClient.NetworkingV1.CreateNamespacedIngressAsync(ingress, namespaces);
        }
        public async Task DeleteIngressAsync(string name, string namespaces)
        {
            await _kubernetesClient.NetworkingV1.DeleteNamespacedIngressAsync(name, namespaces);
        }
        #endregion

        #region Kubernetes Secret
        public async Task<IEnumerable<V1Secret>> ListSecretsAsync(string? namespaces = null)
        {
            var secrets = string.IsNullOrEmpty(namespaces)
                ? await _kubernetesClient.CoreV1.ListSecretForAllNamespacesAsync()
                : await _kubernetesClient.CoreV1.ListNamespacedSecretAsync(namespaces);
            return secrets.Items;
        }
        public async Task<V1Secret> GetSecretsAsync(string name, string namespaces)
        {
            try
            {
                return await _kubernetesClient.CoreV1.ReadNamespacedSecretAsync(name, namespaces);
            }
            catch (k8s.Autorest.HttpOperationException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }
        public async Task<V1Secret> CreateSecretsAsync(V1Secret secret, string namespaces)
        {
            return await _kubernetesClient.CoreV1.CreateNamespacedSecretAsync(secret, namespaces);
        }
        public async Task DeleteSecretsAsync(string name, string namespaces)
        {
            await _kubernetesClient.CoreV1.DeleteNamespacedSecretAsync(name, namespaces);
        }
        #endregion

        #region Kubernetes Namespaces
        public async Task<IEnumerable<V1Namespace>> ListNamespacesAsync()
        {
            var response = await _kubernetesClient.CoreV1.ListNamespaceAsync();
            return response.Items;
        }
        public async Task<V1Namespace> GetNamespacesAsync(string name)
        {
            try
            {
                return await _kubernetesClient.CoreV1.ReadNamespaceAsync(name);
            }
            catch (k8s.Autorest.HttpOperationException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }
        public async Task<V1Namespace> CreateNamespacesAsync(V1Namespace created)
        {
            return await _kubernetesClient.CoreV1.CreateNamespaceAsync(created);
        }
        public async Task DeleteNamespacesAsync(string name)
        {
            await _kubernetesClient.CoreV1.DeleteNamespaceAsync(name);
        }
        #endregion
    }
}
