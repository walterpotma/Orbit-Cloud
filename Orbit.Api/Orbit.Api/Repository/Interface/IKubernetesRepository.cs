using k8s;
using k8s.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Api.Repository.Interface
{
    public interface IKubernetesRepository
    {
        #region Kubernetes Deployments
        Task<V1DeploymentList> GetDeploymentsAsync(string namespaceName = "");
        #endregion

        #region Kubernetes Pods
        Task<IEnumerable<V1Pod>> ListPodsAsync(string? namespaces = null);
        Task<V1Pod> GetPodsAsync(string name, string namespaces);
        Task DeletePodsAsync(string name, string namespaces);
        Task<PodMetricsList> GetPodMetricsAsync();
        #endregion

        #region Kubernetes Service
        Task<IEnumerable<V1Service>> ListServicesAsync(string? namespaceName = null);
        Task<V1Service> GetServicesAsync(string name, string namespaces);
        Task<V1Service> CreateServicesAsync(V1Service service, string namespaces);
        Task DeleteServicesAsync(string name, string namespaces);
        #endregion

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
        Task<V1Namespace> GetNamespacesAsync(string name);
        Task<V1Namespace> CreateNamespacesAsync(V1Namespace ns);
        Task DeleteNamespacesAsync(string name);
        #endregion
    }
}
