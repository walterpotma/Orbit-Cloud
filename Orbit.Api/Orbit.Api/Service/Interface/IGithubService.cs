using Orbit.Api.Dto.Github;

namespace Orbit.Api.Service.Interface
{
    public interface IGithubService
    {
        Task<IEnumerable<DtoGithubRepos>> GetCurrentUserRepositoriesAsync();

        #region Github Webhooks
        Task<IEnumerable<DtoWebhookResponse>> GetCurrentUserRepoWebhooksAsync(string owner, string repoName);
        Task<DtoWebhookResponse> GetCurrentUserRepoWebhookIdAsync(string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateCurrentUserRepoWebhookAsync(string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync (string owner, string repoName, int hookId);
        #endregion
    }
}
