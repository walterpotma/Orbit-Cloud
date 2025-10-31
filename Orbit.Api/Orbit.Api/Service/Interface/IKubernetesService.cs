using Orbit.Api.Dto.kubernetes;

namespace Orbit.Api.Service.Interface
{
    public interface IKubernetesService
    {
        Task<IEnumerable<DtoPod>> GetAllPodsAsync(string? namespaceName = null);
        Task<IEnumerable<DtoService>> GetAllServicesAsync(string? namespaceName = null);
        Task<IEnumerable<DtoIngress>> GetAllIngressesAsync(string? namespaceName = null);

        #region Kubernetes Secret
        Task<IEnumerable<DtoSecretResponse>> GetAllSecretsAsync(string? namespaceName = null);
        Task<DtoSecretResponse> GetSecretsAsync(string name, string namespaces);
        Task<DtoSecretResponse> CreateSecretsAsync(DtoSecretRequest request, string namespaces);
        Task DeleteSecretsAsync(string name, string namespaces);
        #endregion

        #region Kubernetes Namespace
        Task<IEnumerable<DtoNamespaceResponse>> GetAllNamespacesAsync();
        Task<DtoNamespaceResponse> GetNamespaceAsync(string name);
        Task<DtoNamespaceResponse> CreateNamespaceAsync(DtoNamespaceRequest request);
        Task DeleteNamespaceAsync(string name);
        #endregion
    }
}
