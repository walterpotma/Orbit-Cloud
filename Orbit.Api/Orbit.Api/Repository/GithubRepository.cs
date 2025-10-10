using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Dto;
using Orbit.Api.Dto_s;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Orbit.Api.Repository
{
    public class GithubRepository : IGithubRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public GithubRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async Task<string> GetAccessTokenAsync(string code)
        {
            var httpClient = _httpClientFactory.CreateClient("GitHub");
            var tokenEndpoint = "https://github.com/login/oauth/access_token";

            var requestBody = new
            {
                client_id = _configuration["Authentication:GitHub:ClientId"],
                client_secret = _configuration["Authentication:GitHub:ClientSecret"],
                code
            };

            var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json")
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            using var responseStream = await response.Content.ReadAsStreamAsync();
            var tokenData = await JsonSerializer.DeserializeAsync<JsonElement>(responseStream);

            var accessToken = tokenData.GetProperty("access_token").GetString();
            if (string.IsNullOrEmpty(accessToken))
            {
                throw new InvalidOperationException("Não foi possível obter o token de acesso do GitHub.");
            }
            return accessToken;
        }

        public async Task<DtoGithub> GetUserFromTokenAsync(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient("GitHub");
            var userEndpoint = "https://api.github.com/user";

            var request = new HttpRequestMessage(HttpMethod.Get, userEndpoint);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit.Api", "1.0"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            using var responseStream = await response.Content.ReadAsStreamAsync();
            var user = await JsonSerializer.DeserializeAsync<DtoGithub>(responseStream);

            if (user == null)
            {
                throw new InvalidOperationException("Não foi possível deserializar os dados do usuário do GitHub.");
            }
            return user;
        }

        public async Task<IEnumerable<DtoGithubRepos>> GetUserRepositoriesAsync(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/repos?type=owner");

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                // Aqui você pode tratar o erro de forma mais robusta, se desejar
                throw new HttpRequestException($"Erro ao buscar repositórios do GitHub. Status: {response.StatusCode}");
            }

            var responseStream = await response.Content.ReadAsStreamAsync();
            var repositories = await JsonSerializer.DeserializeAsync<IEnumerable<DtoGithubRepos>>(responseStream);

            return repositories ?? new List<DtoGithubRepos>();
        }
    }
}
