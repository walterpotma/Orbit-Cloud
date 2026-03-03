using Orbit.Application.DTOs.Github;

namespace Orbit.Domain.Interfaces
{
    public interface IGithubRepository
    {
        #region Github Repositories
        Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync();
        // Task<DtoReposResponse> GetRepositoryByNameAsync(string repoName);
        // Task CloneReposByNameAsync(string repoName);
        #endregion
    }
}