namespace Orbit.Application.Interfaces
{
    public interface IGithubAuthService
    {
        string GenerateJwt();
        Task<string> GetInstallationTokenAsync(string installationId);
    }
}