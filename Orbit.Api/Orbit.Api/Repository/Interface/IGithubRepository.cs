using Orbit.Api.Dto.Github;
using Orbit.Api.Model;
using System.Security.Claims;

namespace Orbit.Api.Repository.Interface
{
    public interface IGithubRepository
    {
        Task<string> GetAccessTokenAsync(string code);
        Task<DtoGithub> GetUserFromTokenAsync(string accessToken);
        Task<IEnumerable<DtoGithubRepos>> GetUserRepositoriesAsync(string accessToken);

        #region Github Webhooks
        Task<IEnumerable<DtoWebhookResponse>> GetRepositoryWebhooksAsync(string accessToken, string owner, string repoName);
        Task<DtoWebhookResponse> GetRepositoryWebhookIdAsync(string accessToken, string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateRepositoryWebhookAsync(string accessToken, string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync (string accessToken, string owner, string repoName, int hookId);
        #endregion
    }
}
