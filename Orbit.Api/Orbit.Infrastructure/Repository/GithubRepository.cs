using System.Net.Http.Headers;
using System.Net.Http.Json; 
using System.Text.Json;
using Orbit.Domain.Interfaces;
// using Orbit.Application.DTOs.Github; // Pode comentar se der erro de namespace não encontrado

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

            var response = await _httpClient.GetAsync("https://api.github.com/installation/repositories");
            response.EnsureSuccessStatusCode();

            var data = await response.Content.ReadFromJsonAsync<GithubRepoListResponse>();

            return data?.repositories ?? Enumerable.Empty<DtoGithubReposResponse>();
        }
    }

    // Classe auxiliar local para o build não quebrar
    public class GithubRepoListResponse
    {
        public List<DtoGithubReposResponse> repositories { get; set; } = new();
    }
}