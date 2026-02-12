// Orbit.Infrastructure.Repositories/GithubRepository.cs
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

        // Defina um caminho padrão base
        private const string BaseStoragePath = "/app/orbit-clones"; 

        public GithubRepository(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        // ... (Seus outros métodos de API HTTP continuam iguais) ...

        // ============================================================
        // A LÓGICA DE CLONE FICA SOMENTE AQUI
        // ============================================================
        public async Task CloneReposByNameAsync(string accessToken, string owner, string repoName, string githubId)
        {
            var cloneUrl = $"https://github.com/{owner}/{repoName}.git";

            // Caminho organizado: /app/orbit-clones/{ID}/{RepoName}
            var userPath = Path.Combine(BaseStoragePath, githubId);
            var targetPath = Path.Combine(userPath, repoName);

            Console.WriteLine($"[REPO] Preparando clone de {repoName} para {targetPath}...");

            // Lógica de limpeza de diretório
            if (Directory.Exists(targetPath))
            {
                DeleteReadOnlyDirectory(targetPath);
            }
            else
            {
                // Garante que a pasta do usuário exista
                Directory.CreateDirectory(userPath);
            }

            var options = new CloneOptions
            {
                Credentials = new UsernamePasswordCredentials
                {
                    Username = "oauth2", // Padrão
                    Password = accessToken
                },
                BranchName = "main", // Idealmente isso viria parametrizado no futuro
                RecurseSubmodules = true
            };

            // Executa o clone
            // Envolvemos em Task.Run pois o LibGit2Sharp é síncrono e bloqueante
            await Task.Run(() => Repository.Clone(cloneUrl, targetPath, options));

            Console.WriteLine($"[REPO] Sucesso! Clonado em: {targetPath}");
        }

        // Helper essencial para deletar arquivos .git (que são ReadOnly)
        private void DeleteReadOnlyDirectory(string targetDir)
        {
            var dir = new DirectoryInfo(targetDir);
            dir.Attributes = FileAttributes.Normal;

            foreach (var info in dir.GetFileSystemInfos("*", SearchOption.AllDirectories))
            {
                info.Attributes = FileAttributes.Normal;
            }

            dir.Delete(true);
        }
    }
}