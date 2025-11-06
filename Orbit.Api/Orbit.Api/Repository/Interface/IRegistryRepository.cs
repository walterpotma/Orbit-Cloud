namespace Orbit.Api.Repository.Interface
{
    public interface IRegistryRepository
    {
        Task<List<string>> GetRepositoriesAsync();
        Task<List<string>> GetTagsAsync(string repositoryName);
        Task<bool> DeleteTagAsync(string repositoryName, string tag);
    }
}
