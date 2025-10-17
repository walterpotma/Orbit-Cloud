using Orbit.Api.Dto.kubertnetes;

namespace Orbit.Api.Service.Interface
{
    public interface IKubernetesService
    {
        Task<IEnumerable<DtoPod>> GetAllPodsAsync(string? namespaceName = null);
        Task<IEnumerable<DtoService>> GetAllServicesAsync(string? namespaceName = null);
        Task<IEnumerable<DtoIngress>> GetAllIngressesAsync(string? namespaceName = null);
        Task<IEnumerable<DtoSecret>> GetAllSecretsAsync(string? namespaceName = null);
        Task<IEnumerable<DtoNamespace>> GetAllNamespacesAsync();
    }
}
