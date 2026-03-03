// Orbit.Infrastructure.Services/GithubService.cs
using System.Security.Claims; // Necessário para ler o ID do usuário
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Orbit.Application.Interfaces;
using Orbit.Domain.Entities.Github;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Services
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

        public async Task<IEnumerable<DtoReposResponse>> GetCurrentUserRepositoriesAsync()
        {
            // Pega o token do contexto
            var accessToken = await GetAccessTokenAsync();
            // Repassa para o repositório
            return await _githubRepository.GetUserRepositoriesAsync(accessToken);
        }

        public async Task<DtoReposResponse> GetCurrentUserRepositoryAsync(string owner, string repoName)
        {
            var accessToken = await GetAccessTokenAsync();
            return await _githubRepository.GetRepositoryByNameAsync(accessToken, owner, repoName);
        }
        // ============================================================
        // CORREÇÃO AQUI: O método vira apenas um repassador (Proxy)
        // ============================================================
        public async Task CloneReposByNameAsync(string owner, string repoName)
        {
            // 1. O Service resolve a autenticação
            var accessToken = await GetAccessTokenAsync();
            
            // 2. O Service resolve QUEM é o usuário
            var githubId = GetCurrentGithubId();

            // 3. O Service manda o Repository fazer o trabalho sujo
            await _githubRepository.CloneReposByNameAsync(accessToken, owner, repoName, githubId);
        }

        // Helper para pegar o ID do Claims
        private string GetCurrentGithubId()
        {
            var id = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(id))
                throw new UnauthorizedAccessException("ID do usuário GitHub não encontrado no contexto.");
            
            return id;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var accessToken = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");
            if (string.IsNullOrEmpty(accessToken))
                throw new UnauthorizedAccessException("Token de acesso não encontrado.");
            return accessToken;
        }

        // ... (Pode remover o método antigo CloneRepos com ShellScript se não for mais usar) ...
    }
}