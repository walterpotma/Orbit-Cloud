using Octokit;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using System.Security.Cryptography;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Repository = Octokit.Repository;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly string _appId = "1981006";
        private readonly string _privateKeyPath = Path.Combine(AppContext.BaseDirectory, "orbit-ci-cd.2026-03-30.private-key.pem");
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
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
    }
}