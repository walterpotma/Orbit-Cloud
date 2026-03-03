using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Domain.Interfaces
{
    public interface IGithubRepository
    {
        #region Github Repositories
        Task<IEnumerable<DtoGithubReposResponse>> GetUserRepositoriesAsync();
        // Task<DtoReposResponse> GetRepositoryByNameAsync(string repoName);
        // Task CloneReposByNameAsync(string repoName);
        #endregion
    }
}