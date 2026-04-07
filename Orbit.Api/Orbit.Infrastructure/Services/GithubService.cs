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

            using var rsa = RSA.Create();
            rsa.ImportFromPem(pemContent.ToCharArray());

            var rsaParams = rsa.ExportParameters(true);
            var rsaCopy = RSA.Create();
            rsaCopy.ImportParameters(rsaParams);

            var handler = new JwtSecurityTokenHandler();
            var descriptor = new SecurityTokenDescriptor
            {
                Issuer = _appId,
                IssuedAt = DateTime.UtcNow.AddSeconds(-60),
                Expires = DateTime.UtcNow.AddMinutes(9),
                SigningCredentials = new SigningCredentials(
                    new RsaSecurityKey(rsaCopy),
                    SecurityAlgorithms.RsaSha256
                )
            };

            var token = handler.CreateToken(descriptor);
            return handler.WriteToken(token);
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

            // Caminho base no Hayom
            var userPath = Path.Combine("/data/archive/clients", githubId, "tmp");
            var localPath = Path.Combine(userPath, appName);

            // 1. Limpeza Garantida
            if (Directory.Exists(localPath))
            {
                // No Linux, precisamos garantir que arquivos de sistema não travem a exclusão
                var di = new DirectoryInfo(localPath);
                foreach (var file in di.GetFiles("*", SearchOption.AllDirectories)) file.Attributes = FileAttributes.Normal;
                Directory.Delete(localPath, true);
            }

            Directory.CreateDirectory(userPath);

            var options = new LibGit2Sharp.CloneOptions
            {
                FetchOptions =
        {
            CredentialsProvider = (_url, _user, _cred) =>
                new LibGit2Sharp.UsernamePasswordCredentials
                {
                    // Essencial para GitHub Apps
                    Username = "x-access-token",
                    Password = accessToken
                }
        },
                // 2. Checkout automático para evitar que a pasta fique vazia
                Checkout = true
            };

            try
            {
                // 3. O Clone propriamente dito
                await Task.Run(() => LibGit2Sharp.Repository.Clone(cloneUrl, localPath, options));
                Console.WriteLine($"[ORBIT-PIPELINE] Clone concluído com sucesso em: {localPath}");
            }
            catch (LibGit2SharpException ex) when (ex.Message.Contains("404"))
            {
                // Se der 404 aqui, é porque a URL está vindo sem o .git ou o Token não tem escopo
                throw new Exception($"O GitHub retornou Not Found. Verifique se a URL {cloneUrl} está correta e se o App tem permissão de 'Contents'.");
            }

            return localPath;
        }
    }
}