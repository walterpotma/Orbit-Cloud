using Microsoft.AspNetCore.Authentication;
using Orbit.Application.DTOs.Github;
using Orbit.Api.Helpers;
using Orbit.Domain.Interfaces;
using Orbit.Application.Interfaces;

namespace Orbit.Infraestrutura.Services
{
    public class GithubService : IGithubService
    {
        private readonly IConfiguration _configuration;
        private readonly IGithubRepository _githubRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GithubService(IGithubRepository githubRepository, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _githubRepository = githubRepository;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        #region Github Repositories
        public async Task<IEnumerable<DtoReposResponse>> GetCurrentUserRepositoriesAsync()
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetUserRepositoriesAsync(accessToken);
        }
        public async Task<DtoReposResponse> GetCurrentUserRepositoryAsync(string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetRepositoryByNameAsync(accessToken, owner, repoName);
        }
        public async Task CloneReposByNameAsync(string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            await _githubRepository.CloneReposByNameAsync(accessToken, owner, repoName);
        }

        public async Task CloneRepos(string githubId, string reposURL, string authToken, string appName)
        {
            var scriptPath = _configuration["FileExplorer:ClonePack"];

            // Segurança: Verifica se achou o valor
            if (string.IsNullOrEmpty(scriptPath))
            {
                throw new Exception("ERRO: A configuração 'Clone.SH' não foi encontrada no appsettings.json.");
            }

            // Segundo: Prepara os argumentos ($1 $2)
            var args = $"{githubId} {reposURL} {authToken} {appName}";

            Console.WriteLine($"[API] Chamando clonador de repos para {appName} em {scriptPath}...");

            // Terceiro: Executa
            var result = await ShellHelper.RunScriptAsync(scriptPath, args);

            if (result.ExitCode == 0)
            {
                Console.WriteLine("[API] Repos clonado com sucesso!");
            }
            else
            {
                Console.WriteLine($"[API] Erro ao clonar: {result.Error}");
                throw new Exception($"Falha na clonagem: {result.Error}");
            }
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