using LibGit2Sharp;
using Microsoft.Extensions.Configuration;
using Orbit.Domain.Entities.Github;
using Orbit.Domain.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Orbit.Infrastructure.Repositories
{
    public class GithubRepository : IGithubRepository
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private const string BaseStoragePath = "/app/orbit-clones";

        public GithubRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // --- MÉTODOS OBRIGATÓRIOS PELA INTERFACE ---

        public async Task<IEnumerable<DtoReposResponse>> GetUserRepositoriesAsync(string accessToken)
        {
            // ... (Seu código HTTP existente para listar repos) ...
            // Se você não tiver o código aqui, o build vai falhar.
            // Vou colocar um stub caso você tenha perdido:
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/repos?type=owner");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();
            return await JsonSerializer.DeserializeAsync<IEnumerable<DtoReposResponse>>(stream);
        }

        public async Task<DtoReposResponse> GetRepositoryByNameAsync(string accessToken, string owner, string repoName)
        {
            // ... (Seu código HTTP existente para pegar 1 repo) ...
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.github.com/repos/{owner}/{repoName}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            using var stream = await response.Content.ReadAsStreamAsync();
            return await JsonSerializer.DeserializeAsync<DtoReposResponse>(stream);
        }

        // --- LÓGICA DO CLONE (PERFEITA) ---
        public async Task CloneReposByNameAsync(string accessToken, string owner, string repoName, string githubId)
        {
            var cloneUrl = $"https://github.com/{owner}/{repoName}.git";
            var userPath = Path.Combine(BaseStoragePath, githubId);
            var targetPath = Path.Combine(userPath, repoName);

            Console.WriteLine($"[REPO] Clone: {repoName} -> {targetPath}");

            if (Directory.Exists(targetPath)) DeleteReadOnlyDirectory(targetPath);
            else Directory.CreateDirectory(userPath);

            var options = new CloneOptions
            {
                // CORREÇÃO: As credenciais ficam dentro de FetchOptions -> CredentialsProvider
                FetchOptions =
                {
                    CredentialsProvider = (_url, _user, _cred) => new UsernamePasswordCredentials
                    {
                        Username = "oauth2",
                        Password = accessToken
                    }
                },
                BranchName = "main",
                RecurseSubmodules = true
            };

            await Task.Run(() => Repository.Clone(cloneUrl, targetPath, options));
            Console.WriteLine($"[REPO] Sucesso!");
        }

        private void DeleteReadOnlyDirectory(string targetDir)
        {
            var dir = new DirectoryInfo(targetDir);
            dir.Attributes = FileAttributes.Normal;
            foreach (var info in dir.GetFileSystemInfos("*", SearchOption.AllDirectories)) info.Attributes = FileAttributes.Normal;
            dir.Delete(true);
        }
    }
}