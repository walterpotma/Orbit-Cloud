namespace Orbit.Api.Repository.Interface
{
    public interface IRegistryRepository
    {
        Task<List<string>> GetRepositoriesAsync();
        Task<List<string>> GetTagsAsync(string repositoryName);
        Task BuildImageAsync(string buildContextPath, string dockerfilePath, string fullImageNameWithTag);
        Task PushImageAsync(string fullImageNameWithTag);
    }
}
