using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public interface IGithubAuthService
    {
        Task RegisterInstallationAsync(string installationId, string githubId);
    }
}