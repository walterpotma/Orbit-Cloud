using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Dto.Github;
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

        #region Github Authentication
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
        #endregion

        #region Github Repositories
        public async Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync(string accessToken)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/repos?type=owner");

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao buscar repositórios do GitHub. Status: {response.StatusCode}");
            }

            var responseStream = await response.Content.ReadAsStreamAsync();
            var repositories = await JsonSerializer.DeserializeAsync<IEnumerable<DtoReposResponse>>(responseStream);

            return repositories ?? new List<DtoReposResponse>();
        }
        public async Task<DtoReposResponse> GetRepositoryByNameAsync(string accessToken, string owner, string repoName)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}";
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));
            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao buscar repositório do GitHub. Status: {response.StatusCode}");
            }
            var responseStream = await response.Content.ReadAsStreamAsync();
            var repository = await JsonSerializer.DeserializeAsync<DtoReposResponse>(responseStream);
            if (repository == null)
            {
                throw new InvalidOperationException("Não foi possível deserializar os dados do repositório do GitHub.");
            }
            return repository;
        }
        public async Task CloneReposByNameAsync(string accessToken, string owner, string repoName)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}/zipball";
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));
            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao clonar repositório do GitHub. Status: {response.StatusCode}");
            }
        }
        #endregion

        #region Github Webhooks
        public async Task<IEnumerable<DtoWebhookResponse>> GetRepositoryWebhooksAsync(string accessToken, string owner, string repoName)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}/hooks";

            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);

            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao buscar webhooks do GitHub. Status: {response.StatusCode}");
            }

            var responseStream = await response.Content.ReadAsStreamAsync();
            var webhooks = await JsonSerializer.DeserializeAsync<IEnumerable<DtoWebhookResponse>>(responseStream);

            return webhooks ?? new List<DtoWebhookResponse>();
        }

        public async Task<DtoWebhookResponse> GetRepositoryWebhookIdAsync(string accessToken, string owner, string repoName, int hookId)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}/hooks/{hookId}";
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));
            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao buscar webhook do GitHub. Status: {response.StatusCode}");
            }
            var responseStream = await response.Content.ReadAsStreamAsync();
            var webhook = await JsonSerializer.DeserializeAsync<DtoWebhookResponse>(responseStream);
            if (webhook == null)
            {
                throw new InvalidOperationException("Não foi possível deserializar os dados do webhook do GitHub.");
            }
            return webhook;
        }

        public async Task<DtoWebhookResponse> CreateRepositoryWebhookAsync(string accessToken, string owner, string repoName, DtoWebhookRequest request)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}/hooks";

            var httpClient = _httpClientFactory.CreateClient();

            var githubPayload = new
            {
                name = "web",
                active = true,
                events = request.Events,
                config = new
                {
                    url = request.Url,
                    content_type = request.ContentType
                }
            };

            var jsonPayload = JsonSerializer.Serialize(githubPayload);
            var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpointUrl)
            {
                Content = content
            };

            httpRequest.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            httpRequest.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Erro ao criar webhook. Status: {response.StatusCode}. Body: {errorBody}");
            }

            var responseStream = await response.Content.ReadAsStreamAsync();
            var createdWebhook = await JsonSerializer.DeserializeAsync<DtoWebhookResponse>(responseStream);

            return createdWebhook;
        }

        public async Task DeleteWebhookAsync(string accessToken, string owner, string repoName, int hookId)
        {
            var endpointUrl = $"https://api.github.com/repos/{owner}/{repoName}/hooks/{hookId}";
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Delete, endpointUrl);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));
            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Erro ao deletar webhook do GitHub. Status: {response.StatusCode}");
            }
        }
        #endregion
    }
}