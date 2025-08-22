using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class GithubRepository : IGithubRepository
    {
        private readonly HttpClient _httpClient;

        public GithubRepository(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("OrbitApp");
        }

        public async Task<List<GitRepos>> GetRepository(string accessToken)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            var response = await _httpClient.GetAsync("https://api.github.com/user/repos");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var repos = System.Text.Json.JsonSerializer.Deserialize<List<GitRepos>>(json,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return repos;
        }
    }
}
