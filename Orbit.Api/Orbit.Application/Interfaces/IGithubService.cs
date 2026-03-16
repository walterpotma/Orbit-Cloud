using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        Task RegisterInstallationAsync(string installationId, string githubId);
    }
}