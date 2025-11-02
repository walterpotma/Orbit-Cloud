using Orbit.Api.Dto.kubernetes;

namespace Orbit.Api.Service.Interface
{
    public interface IKubernetesService
    {
        #region Kubernetes Pods
        Task<IEnumerable<DtoPodResponse>> GetAllPodsAsync(string? namespaces = null);
        Task<DtoPodResponse> GetPodsAsync(string name, string namespaces);
        Task DeletePodsAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Service
        Task<IEnumerable<DtoServiceResponse>> GetAllServicesAsync(string? namespaces = null);
        Task<DtoServiceResponse> GetServicesAsync(string name, string namespaces);
        Task<DtoServiceResponse> CreateServicesAsync(DtoServiceRequest request, string namespaces);
        Task DeleteServicesAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Ingress
        Task<IEnumerable<DtoIngressResponse>> GetAllIngressAsync(string? namespaces = null);
        Task<DtoIngressResponse> GetIngressAsync(string name, string namespaces);
        Task<DtoIngressResponse> CreateIngressAsync(DtoIngressRequest request, string namespaces);
        Task DeleteIngressAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Secret
        Task<IEnumerable<DtoSecretResponse>> GetAllSecretsAsync(string? namespaceName = null);
        Task<DtoSecretResponse> GetSecretsAsync(string name, string namespaces);
        Task<DtoSecretResponse> CreateSecretsAsync(DtoSecretRequest request, string namespaces);
        Task DeleteSecretsAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Namespace
        Task<IEnumerable<DtoNamespaceResponse>> GetAllNamespacesAsync();
        Task<DtoNamespaceResponse> GetNamespacesAsync(string name);
        Task<DtoNamespaceResponse> CreateNamespacesAsync(DtoNamespaceRequest request);
        Task DeleteNamespacesAsync(string name);
        #endregion
    }
}