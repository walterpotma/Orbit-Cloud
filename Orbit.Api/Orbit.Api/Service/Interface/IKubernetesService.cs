using Orbit.Api.Dto.kubernetes;

namespace Orbit.Api.Service.Interface
{
    public interface IKubernetesService
    {
        Task<IEnumerable<DtoPod>> GetAllPodsAsync(string? namespaceName = null);
        Task<IEnumerable<DtoService>> GetAllServicesAsync(string? namespaceName = null);



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