using Orbit.Api.Dto.Github;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;
using Microsoft.AspNetCore.Authentication;

namespace Orbit.Api.Service
{
    public class GithubService : IGithubService
    {
        private readonly IGithubRepository _githubRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GithubService(IGithubRepository githubRepository, IHttpContextAccessor httpContextAccessor)
        {
            _githubRepository = githubRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        #region Github Repositories
        public async Task<IEnumerable<DtoReposResponse>> GetCurrentUserRepositoriesAsync()
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetUserRepositoriesAsync(accessToken);
        }
        public async Task<DtoReposResponse> GetCurrentUserRepositoryByNameAsync(string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetRepositoryByNameAsync(accessToken, owner, repoName);
        }
        public async Task CloneReposByName(string acessToken, string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            await _githubRepository.CloneReposByNameAsync(accessToken, owner, repoName);
        }
        #endregion

        #region Gtihub Webhooks
        public async Task<IEnumerable<DtoWebhookResponse>> GetCurrentUserRepoWebhooksAsync(string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetRepositoryWebhooksAsync(accessToken, owner, repoName);
        }

        public async Task<DtoWebhookResponse> GetCurrentUserRepoWebhookIdAsync(string owner, string repoName, int hookId)
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetRepositoryWebhookIdAsync(accessToken, owner, repoName, hookId);
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var accessToken = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(accessToken))
            {
                throw new System.Exception("Token de acesso não encontrado. O usuário está autenticado?");
            }
            return accessToken;
        }

        public async Task<DtoWebhookResponse> CreateCurrentUserRepoWebhookAsync(string owner, string repoName, DtoWebhookRequest request)
        {
            var accessToken = await GetAccessTokenAsync();

            return await _githubRepository.CreateRepositoryWebhookAsync(accessToken, owner, repoName, request);
        }

        public async Task DeleteWebhookAsync(string owner, string repoName, int hookId)
        {
            var accessToken = await GetAccessTokenAsync();
            await _githubRepository.DeleteWebhookAsync(accessToken, owner, repoName, hookId);
        }
        #endregion
    }
}