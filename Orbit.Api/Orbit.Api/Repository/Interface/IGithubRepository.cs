using Orbit.Api.Dto.github;
using Orbit.Api.Dto.Github;
using Orbit.Api.Model;
using System.Security.Claims;

namespace Orbit.Api.Repository.Interface
{
    public interface IGithubRepository
    {
        #region Github Authentication
        Task<string> GetAccessTokenAsync(string code);
        Task<DtoGithub> GetUserFromTokenAsync(string accessToken);
        #endregion

        #region Github Repositories
        Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync(string accessToken);
        Task<DtoReposResponse> GetRepositoryByNameAsync(string accessToken, string owner, string repoName);
        Task CloneReposByNameAsync(string accessToken, string owner, string repoName);
        bool CloneRepository(DtoCloneRequest request);
        #endregion

        #region Github Webhooks
        Task<IEnumerable<DtoWebhookResponse>> GetRepositoryWebhooksAsync(string accessToken, string owner, string repoName);
        Task<DtoWebhookResponse> GetRepositoryWebhookIdAsync(string accessToken, string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateRepositoryWebhookAsync(string accessToken, string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync (string accessToken, string owner, string repoName, int hookId);
        #endregion
    }
}
