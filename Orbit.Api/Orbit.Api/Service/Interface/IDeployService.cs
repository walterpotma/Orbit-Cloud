using Orbit.Api.Dto.kubertnetes;

namespace Orbit.Api.Service.Interface
{
    public interface IDeployService
    {
        Task<DtoDeployment> CreateOrUpdateDeploymentAsync(DtoDeployRequest request);
    }
}
