using Microsoft.AspNetCore.Authentication;
using Orbit.Api.Dto;
using Orbit.Api.Dto_s;
using Orbit.Api.Model;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;
using System.Security.Claims;

namespace Orbit.Api.Service
{
    public class GithubService
    {
        private readonly IGithubRepository _githubRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GithubService(IGithubRepository githubRepository, IHttpContextAccessor httpContextAccessor)
        {
            _githubRepository = githubRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<DtoGithubRepos>> GetCurrentUserRepositoriesAsync()
        {
            // Pega o token de acesso que foi salvo no cookie durante o login
            var accessToken = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(accessToken))
            {
                // Lança uma exceção se o usuário não estiver logado ou o token não for encontrado
                throw new System.Exception("Token de acesso não encontrado. O usuário está autenticado?");
            }

            // Chama o repositório para buscar os dados
            return await _githubRepository.GetUserRepositoriesAsync(accessToken);
        }
    }
}
