using Orbit.Domain.Entities.Github;

namespace Orbit.Domain.Interfaces
{
    public interface IGithubRepository
    {
        // Task<DtoGithub> GetUserFromTokenAsync(string accessToken);

        #region Github Repositories
        Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync(string accessToken);
        Task<DtoReposResponse> GetRepositoryByNameAsync(string accessToken, string owner, string repoName);

        Task CloneReposByNameAsync(string accessToken, string owner, string repoName, string githubId);
        #endregion
    }
}