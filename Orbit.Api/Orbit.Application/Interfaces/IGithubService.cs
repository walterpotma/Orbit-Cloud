using Octokit;

namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        Task RegisterInstallationAsync(string installationId, string githubId);
        Task<IReadOnlyList<Octokit.Repository>> GetRepositoriesAsync(long installationId);
    }
}