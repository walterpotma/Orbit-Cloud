using Orbit.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Orbit.Infraestructure.Repositories
{
    public class RegistryRepository : IRegistryRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _registryBaseUrl;
        private readonly ILogger<RegistryRepository> _logger;

        public RegistryRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<RegistryRepository> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
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
        public async Task<bool> DeleteTagAsync(string repositoryName, string tag)
        {
            _logger.LogInformation("Iniciando delete da tag {tag} do repo {repo}", tag, repositoryName);

            // <-- CORREÇÃO 2: Criar o cliente primeiro
            var client = _httpClientFactory.CreateClient("RegistryApiClient");

            // ETAPA 1: Obter o Digest da Tag

            // <-- CORREÇÃO 4: Montar a URL completa
            var request = new HttpRequestMessage(HttpMethod.Head, $"{_registryBaseUrl}/v2/{repositoryName}/manifests/{tag}");
            request.Headers.Accept.Clear();
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.docker.distribution.manifest.v2+json"));

            string digest;
            try
            {
                // <-- CORREÇÃO 3: Usar 'client', não '_httpClient'
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                if (!response.Headers.TryGetValues("Docker-Content-Digest", out var values))
                {
                    _logger.LogWarning("Não foi possível obter o Docker-Content-Digest para {repo}:{tag}", repositoryName, tag);
                    return false;
                }
                digest = values.First();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Falha ao obter o digest para {repo}:{tag}. A tag/repo existe?", repositoryName, tag);
                return false;
            }

            // ETAPA 2: Deletar o Manifesto usando o Digest
            _logger.LogInformation("Digest encontrado: {digest}. Tentando deletar...", digest);
            try
            {
                // <-- CORREÇÃO 3 e 4: Usar 'client' e a URL completa
                var deleteResponse = await client.DeleteAsync($"{_registryBaseUrl}/v2/{repositoryName}/manifests/{digest}");

                if (deleteResponse.StatusCode == System.Net.HttpStatusCode.Accepted)
                {
                    _logger.LogInformation("Manifesto {digest} deletado com sucesso.", digest);
                    return true;
                }

                _logger.LogWarning("Registry não aceitou o delete. Status: {status}. (Verifique 'delete: enabled: true' na config da registry)", deleteResponse.StatusCode);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha ao deletar o manifesto {digest}", digest);
                return false;
            }
        }
    }
}