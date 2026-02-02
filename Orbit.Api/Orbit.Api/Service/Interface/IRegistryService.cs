using Orbit.Api.Dto.Registry;

namespace Orbit.Api.Service.Interface
{
    public interface IRegistryService
    {
        Task<IEnumerable<DtoImage>> ListImagesAsync();
        Task<DtoImage> GetImageAsync(string imageName);
        Task<bool> DeleteTagAsync(string repositoryName, string tag);
        Task<IEnumerable<DtoImage>> ListImagesByUserAsync(string githubId);
    }
}
