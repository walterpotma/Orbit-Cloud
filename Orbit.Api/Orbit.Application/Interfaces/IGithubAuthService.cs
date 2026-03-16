using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public interface IGithubAuthService
    {
        string GenerateJwt();
        Task<string> GetInstallationTokenAsync(string installationId);
    }
}