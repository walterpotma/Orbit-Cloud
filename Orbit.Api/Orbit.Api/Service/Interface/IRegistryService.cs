using Orbit.Api.Dto.Registry;

namespace Orbit.Api.Service.Interface
{
    public interface IRegistryService
    {
        Task<IEnumerable<DtoImage>> ListImagesAsync();
    }
}
