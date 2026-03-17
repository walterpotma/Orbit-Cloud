using System.Net.Http.Headers;
using System.Net.Http.Json; // Resolve o ReadFromJsonAsync
using System.Text.Json;
using Orbit.Domain.Interfaces;
using Orbit.Application.DTOs.Github; 

namespace Orbit.Infrastructure.Repository
{
    public class GithubRepository : IGithubRepository
    {
        private readonly HttpClient _httpClient;
        private readonly IGithubAuthService _authService;

        public GithubRepository(HttpClient httpClient, IGithubAuthService authService)
        {
            _httpClient = httpClient;
            _authService = authService;
        }

        public async Task<IEnumerable<DtoGithubReposResponse>> GetRepositoriesAsync(string installationId)
        {
            var token = await _authService.GetInstallationToken(installationId);

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("OrbitCloud-App");

            // Chamada para o GitHub
            var response = await _httpClient.GetAsync("https://api.github.com/installation/repositories");
            response.EnsureSuccessStatusCode();

            // Usando o ReadFromJsonAsync com a classe de lista correta
            var data = await response.Content.ReadFromJsonAsync<GithubRepoListResponse>();

            return data?.repositories ?? Enumerable.Empty<DtoGithubReposResponse>();
        }
    }

    // Classes auxiliares para o parse do JSON do GitHub
    public class GithubRepoListResponse
    {
        public List<DtoGithubReposResponse> repositories { get; set; } = new();
    }
    public class GithubTokenResponse
    {
        public string token { get; set; } = string.Empty;
    }
}