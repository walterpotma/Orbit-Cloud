using Octokit;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using System.Security.Cryptography;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Repository = Octokit.Repository;
using Microsoft.AspNetCore.Http;
using LibGit2Sharp;
using Orbit.Infrastructure.Repository; // Se você moveu o Clone para lá

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly string _appId = "1981006";
        private readonly string _privateKeyPath = Path.Combine(AppContext.BaseDirectory, "orbit-ci-cd.2026-03-30.private-key.pem");
        private readonly IGithubRepository _githubRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GithubService(IGithubRepository githubRepository, IHttpContextAccessor httpContextAccessor)
        {
            _githubRepository = githubRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            await Task.CompletedTask;
        }

        public async Task<IReadOnlyList<Octokit.Repository>> GetRepositoriesAsync(long installationId)
        {
            // 1. Gerar o JWT usando bibliotecas padrão da Microsoft
            var pemContent = await File.ReadAllTextAsync(_privateKeyPath);
            using var rsa = RSA.Create();
            // Remove as tags BEGIN/END para importar a chave
            var base64Key = pemContent
                .Replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .Replace("-----END RSA PRIVATE KEY-----", "")
                .Replace("-----BEGIN PRIVATE KEY-----", "")
                .Replace("-----END PRIVATE KEY-----", "")
                .Replace("\n", "").Replace("\r", "").Trim();

            rsa.ImportRSAPrivateKey(Convert.FromBase64String(base64Key), out _);

            var handler = new JsonWebTokenHandler();
            var now = DateTimeOffset.UtcNow;

            var jwt = handler.CreateToken(new SecurityTokenDescriptor
            {
                Issuer = _appId,
                IssuedAt = now.AddSeconds(-60).UtcDateTime,
                Expires = now.AddMinutes(10).UtcDateTime,
                SigningCredentials = new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)
            });

            // 2. Criar o cliente Octokit
            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(jwt, AuthenticationType.Bearer)
            };

            // 3. Token de Instalação e Repositórios
            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            var installationClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(response.Token)
            };

            var reposResponse = await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();
            return reposResponse.Repositories;
        }

        public async Task<string> GetInstallationTokenAsync(long installationId)
        {
            // Usa aquela lógica do JWT que fizemos com RSA para pedir um token de instalação ao GitHub
            var jwt = GenerateJwt(); // Sua função de geração de JWT manual
            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(jwt, AuthenticationType.Bearer)
            };

            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);
            return response.Token;
        }
        
        public async Task<string> CloneRepositoryAsync(string cloneUrl, string accessToken, string appName)
        {
            // 1. Pegar o ID do usuário de forma segura via Claims
            var githubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId))
                throw new Exception("Usuário não autenticado.");

            // 2. Definir o caminho absoluto
            var localPath = Path.Combine("/data/archive/clients", githubId, "tmp", appName);

            // 3. Limpeza Preventiva: Se a pasta já existe (deploy anterior que falhou), apaga
            if (Directory.Exists(localPath))
            {
                Directory.Delete(localPath, true);
            }

            // Garante que a estrutura /data/archive/clients/{id}/tmp existe
            Directory.CreateDirectory(Path.GetDirectoryName(localPath)!);

            var options = new CloneOptions
            {
                Checkout = true,
                // Dica de SRE: Clone apenas o que é necessário (Shallow Clone)
                FetchOptions = { Depth = 1 },
                CredentialsProvider = (_url, _user, _cred) =>
                    new UsernamePasswordCredentials
                    {
                        Username = "x-access-token", // Padrão do GitHub para Apps
                        Password = accessToken
                    }
            };

            // 4. Executa a clonagem em uma Thread separada para não travar a API
            return await Task.Run(() => Repository.Clone(cloneUrl, localPath, options));
        }
    }
}