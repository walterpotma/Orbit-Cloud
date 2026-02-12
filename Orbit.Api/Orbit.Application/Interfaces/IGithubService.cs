using Orbit.Application.DTOs; // Se usar DTOs
using Orbit.Domain.Entities.Github;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        #region Github Repositories
        Task<IEnumerable<DtoReposResponse>> GetCurrentUserRepositoriesAsync();
        Task<DtoReposResponse> GetCurrentUserRepositoryAsync(string owner, string repoName);
        Task CloneReposByNameAsync(string accessToken, string owner, string repoName, string githubId);
        #endregion

        #region Github Webhooks
        Task<IEnumerable<DtoWebhookResponse>> GetCurrentUserRepoWebhooksAsync(string owner, string repoName);
        Task<DtoWebhookResponse> GetCurrentUserRepoWebhookIdAsync(string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateCurrentUserRepoWebhookAsync(string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync(string owner, string repoName, int hookId);
        #endregion
    }
}