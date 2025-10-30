using Orbit.Api.Dto.kubernetes;

namespace Orbit.Api.Service.Interface
{
    public interface IDeployService
    {
        Task<DtoDeployment> CreateOrUpdateDeploymentAsync(DtoDeployRequest request);
    }
}
