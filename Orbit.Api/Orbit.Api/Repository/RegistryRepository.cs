using Orbit.Api.Repository.Interface;
using System.Text.Json;

namespace Orbit.Api.Repository
{
    public class RegistryRepository : IRegistryRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _registryBaseUrl;

        public RegistryRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _registryBaseUrl = configuration["DockerRegistry:Url"]
                ?? throw new InvalidOperationException("URL do Docker Registry não configurada");
        }

        public async Task<List<string>> GetRepositoriesAsync()
        {
            var client = _httpClientFactory.CreateClient("RegistryApiClient");
            var response = await client.GetAsync($"{_registryBaseUrl}/v2/_catalog");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var catalog = JsonSerializer.Deserialize<JsonElement>(json);
            var repos = catalog.GetProperty("repositories").EnumerateArray()
                                  .Select(e => e.GetString() ?? "")
                                  .ToList();
            return repos;
        }

        public async Task<List<string>> GetTagsAsync(string repositoryName)
        {
            var client = _httpClientFactory.CreateClient("RegistryApiClient");
            var response = await client.GetAsync($"{_registryBaseUrl}/v2/{repositoryName}/tags/list");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var tagsDoc = JsonSerializer.Deserialize<JsonElement>(json);
            var tags = tagsDoc.GetProperty("tags").EnumerateArray()
                                .Select(e => e.GetString() ?? "")
                                .ToList();
            return tags;
        }
    }
}