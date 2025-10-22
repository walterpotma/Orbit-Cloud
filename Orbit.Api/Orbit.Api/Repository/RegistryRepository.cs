using Docker.DotNet;
using Docker.DotNet.Models;
using Orbit.Api.Repository.Interface;
using System.Text.Json;

namespace Orbit.Api.Repository
{
    public class RegistryRepository : IRegistryRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly DockerClient _dockerClient;
        private readonly string _registryBaseUrl;

        public RegistryRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration, DockerClient dockerClient)
        {
            _httpClientFactory = httpClientFactory;
            _registryBaseUrl = configuration["DockerRegistry:Url"]
                ?? throw new InvalidOperationException("URL do Docker Registry não configurada");

            // O DockerClient é injetado (vamos registrá-lo no Program.cs)
            _dockerClient = dockerClient;
        }

        // --- Métodos de Listagem (Registry API) ---

        public async Task<List<string>> GetRepositoriesAsync()
        {
            var client = _httpClientFactory.CreateClient();
            // A API do Registry usa o endpoint /v2/_catalog
            var response = await client.GetAsync($"{_registryBaseUrl}/v2/_catalog");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            // A resposta é um JSON tipo {"repositories": ["img1", "img2"]}
            var catalog = JsonSerializer.Deserialize<JsonElement>(json);
            var repos = catalog.GetProperty("repositories").EnumerateArray()
                               .Select(e => e.GetString() ?? "")
                               .ToList();
            return repos;
        }

        public async Task<List<string>> GetTagsAsync(string repositoryName)
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{_registryBaseUrl}/v2/{repositoryName}/tags/list");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            // A resposta é {"name": "...", "tags": ["t1", "t2"]}
            var tagsDoc = JsonSerializer.Deserialize<JsonElement>(json);
            var tags = tagsDoc.GetProperty("tags").EnumerateArray()
                             .Select(e => e.GetString() ?? "")
                             .ToList();
            return tags;
        }

        // --- Métodos de Build/Push (Docker Daemon) ---

        public async Task BuildImageAsync(string buildContextPath, string dockerfilePath, string fullImageNameWithTag)
        {
            // Cria um "tarball" (arquivo .tar) do diretório de build. O Docker só aceita builds via tar.
            // NOTA: Isso lê o diretório do *servidor host*, não do container.
            await CreateTarballForDocker(buildContextPath, "build.tar");

            await using var buildContextStream = new FileStream("build.tar", FileMode.Open, FileAccess.Read);

            await _dockerClient.Images.BuildImageFromDockerfileAsync(new ImageBuildParameters
            {
                Dockerfile = dockerfilePath,
                Tags = new List<string> { fullImageNameWithTag },
                // Opções adicionais se necessário
                // NoOp = true, // Remove o .tar após o build (pode não funcionar em todas as plataformas)
            },
            buildContextStream, // O .tar como um stream
            null, // Auth configs (não necessário para build local)
            null, // Headers
            new Progress<JSONMessage>()); // Para reportar progresso (ignorado por enquanto)

            File.Delete("build.tar"); // Limpa o arquivo tar temporário
        }

        public async Task PushImageAsync(string fullImageNameWithTag)
        {
            // Para "push", você pode precisar de autenticação dependendo do seu registry
            // Por enquanto, assumimos que não precisa se estiver na mesma máquina
            await _dockerClient.Images.PushImageAsync(fullImageNameWithTag, new ImagePushParameters(),
                new AuthConfig(), // Configuração de autenticação
                new Progress<JSONMessage>()); // Progresso
        }

        // Função auxiliar para criar o .tar (necessário para o Docker.DotNet)
        private Task CreateTarballForDocker(string directory, string tarFileName)
        {
            // Usar SharpCompress.Common ou System.Formats.Tar (em .NET 7+)
            // Para simplificar, vamos usar o comando 'tar' do sistema (assumindo que a API roda em Linux)
            // Se a API rodar no container oficial .NET (Debian), 'tar' estará disponível.
            var procStartInfo = new System.Diagnostics.ProcessStartInfo("tar", $"-czf {tarFileName} -C {directory} .")
            {
                RedirectStandardOutput = true
            };
            var proc = System.Diagnostics.Process.Start(procStartInfo);
            proc?.WaitForExit();
            return Task.CompletedTask;
        }
    }
}