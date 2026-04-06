using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Octokit;
using LibGit2Sharp;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly IConfiguration _configuration;
        private readonly IGithubRepository _githubRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        // IDs e Caminhos pegos do Config para evitar erros de Hardcode
        private readonly string _appId;
        private readonly string _privateKeyPath;

        public GithubService(
            IGithubRepository githubRepository,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _githubRepository = githubRepository;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;

            _appId = _configuration["Github:AppId"] ?? "1981006";
            _privateKeyPath = Path.Combine(AppContext.BaseDirectory, "orbit-ci-cd.2026-03-30.private-key.pem");
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            await Task.CompletedTask;
        }

        private string GenerateJwt()
        {
            string pemContent;
            if (File.Exists(_privateKeyPath))
            {
                pemContent = File.ReadAllText(_privateKeyPath);
            }
            else
            {
                pemContent = _configuration["Github:PrivateKey"]
                    ?? throw new Exception("Chave Privada do GitHub não encontrada.");
            }

            using (var rsa = RSA.Create())
            {
                rsa.ImportFromPem(pemContent.ToCharArray());

                var handler = new JwtSecurityTokenHandler();
                var descriptor = new SecurityTokenDescriptor
                {
                    Issuer = _appId,
                    IssuedAt = DateTime.UtcNow.AddSeconds(-60),
                    Expires = DateTime.UtcNow.AddMinutes(9),
                    SigningCredentials = new SigningCredentials(
                        new RsaSecurityKey(rsa),
                        SecurityAlgorithms.RsaSha256
                    )
                };

                var token = handler.CreateToken(descriptor);

                string tokenString = handler.WriteToken(token);

                return tokenString;
            }
        }

        public async Task<IReadOnlyList<Octokit.Repository>> GetRepositoriesAsync(long installationId)
        {
            var jwt = GenerateJwt();

            var appClient = new GitHubClient(new Octokit.ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Octokit.Credentials(jwt, Octokit.AuthenticationType.Bearer)
            };

            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            var installationClient = new GitHubClient(new Octokit.ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Octokit.Credentials(response.Token)
            };

            var reposResponse = await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();
            return reposResponse.Repositories;
        }

        public async Task<string> GetInstallationTokenAsync(long installationId)
        {
            var jwt = GenerateJwt();
            var appClient = new GitHubClient(new Octokit.ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Octokit.Credentials(jwt, Octokit.AuthenticationType.Bearer)
            };

            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);
            return response.Token;
        }

        public async Task<string> CloneRepositoryAsync(string cloneUrl, string accessToken, string appName)
        {
            var githubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId))
                throw new Exception("Usuário não autenticado.");

            var localPath = Path.Combine("/data/archive/clients", githubId, "tmp", appName);

            if (Directory.Exists(localPath))
            {
                // LibGit2Sharp trava arquivos, as vezes Directory.Delete falha se não for recursivo/forçado
                await Task.Run(() => Directory.Delete(localPath, true));
            }

            Directory.CreateDirectory(Path.GetDirectoryName(localPath)!);

            var options = new LibGit2Sharp.CloneOptions
            {
                FetchOptions =
                {
                    CredentialsProvider = (_url, _user, _cred) =>
                        new LibGit2Sharp.UsernamePasswordCredentials
                        {
                            Username = "x-access-token",
                            Password = accessToken
                        }
                }
            };

            await Task.Run(() => LibGit2Sharp.Repository.Clone(cloneUrl, localPath, options));

            return localPath;
        }
    }
}