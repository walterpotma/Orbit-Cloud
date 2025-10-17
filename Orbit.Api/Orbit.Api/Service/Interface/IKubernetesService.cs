using Orbit.Api.Dto.kubertnetes;

namespace Orbit.Api.Service.Interface
{
    public interface IKubernetesService
    {
        Task<IEnumerable<DtoPod>> GetAllPodsAsync();
        Task<IEnumerable<DtoService>> GetAllServicesAsync();
        Task<IEnumerable<DtoIngress>> GetAllIngressesAsync();
        Task<IEnumerable<DtoSecret>> GetAllSecretsAsync();
        Task<IEnumerable<DtoNamespace>> GetAllNamespacesAsync();
    }
}
