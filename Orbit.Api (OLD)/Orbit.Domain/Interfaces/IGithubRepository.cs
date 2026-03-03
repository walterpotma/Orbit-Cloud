using Orbit.Domain.Entities.Github;

namespace Orbit.Domain.Interfaces
{
    public interface IGithubRepository
    {
        // Auth (Se você removeu da classe, remova daqui. Se manteve na classe, pode deixar aqui)
        // Task<string> GetAccessTokenAsync(string code);
        // Task<DtoGithub> GetUserFromTokenAsync(string accessToken);

        #region Github Repositories
        // Estes métodos PRECISAM existir na sua classe GithubRepository
        Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync(string accessToken);
        Task<DtoReposResponse> GetRepositoryByNameAsync(string accessToken, string owner, string repoName);

        // O método novo de Clone
        Task CloneReposByNameAsync(string accessToken, string owner, string repoName, string githubId);
        #endregion

        // Webhooks comentados para não quebrar o build agora
        /*
        Task<IEnumerable<DtoWebhookResponse>> GetRepositoryWebhooksAsync(string accessToken, string owner, string repoName);
        Task<DtoWebhookResponse> GetRepositoryWebhookIdAsync(string accessToken, string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateRepositoryWebhookAsync(string accessToken, string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync (string accessToken, string owner, string repoName, int hookId);
        */
    }
}