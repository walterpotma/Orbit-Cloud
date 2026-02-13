using Orbit.Domain.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        // --- Repositories ---

        // Lista todos (Service pega o token sozinho)
        Task<IEnumerable<DtoReposResponse>> GetCurrentUserRepositoriesAsync();

        // Pega detalhes de um (Service pega o token sozinho)
        Task<DtoReposResponse> GetCurrentUserRepositoryAsync(string owner, string repoName);

        // O Clone (Service pega o token e ID sozinho, então só pede Owner e Repo)
        Task CloneReposByNameAsync(string owner, string repoName);


        // --- Webhooks (Mantenha se você tiver a implementação na classe) ---
        /*
        Task<IEnumerable<DtoWebhookResponse>> GetCurrentUserRepoWebhooksAsync(string owner, string repoName);
        Task<DtoWebhookResponse> GetCurrentUserRepoWebhookIdAsync(string owner, string repoName, int hookId);
        Task<DtoWebhookResponse> CreateCurrentUserRepoWebhookAsync(string owner, string repoName, DtoWebhookRequest request);
        Task DeleteWebhookAsync(string owner, string repoName, int hookId);
        */
    }
}