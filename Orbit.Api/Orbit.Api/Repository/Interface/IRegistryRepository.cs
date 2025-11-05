namespace Orbit.Api.Repository.Interface
{
    public interface IRegistryRepository
    {
        Task<List<string>> GetRepositoriesAsync();
        Task<List<string>> GetTagsAsync(string repositoryName);
    }
}
