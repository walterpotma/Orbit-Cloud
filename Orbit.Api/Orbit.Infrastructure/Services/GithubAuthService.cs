using Microsoft.Extensions.Configuration; // Para o IConfiguration
using Orbit.Application.Interfaces;      // Onde você criou a interface

namespace Orbit.Infrastructure.Services
{
    public class GithubAuthService : IGithubAuthService
    {
        private readonly IConfiguration _config;
        public GithubAuthService(IConfiguration config) => _config = config;

        public async Task<string> GetInstallationTokenAsync(string installationId)
        {
            return await Task.FromResult("token-temporario");
        }

        public string GenerateJwt()
        {
            return "jwt-temporario";
        }
    }
}