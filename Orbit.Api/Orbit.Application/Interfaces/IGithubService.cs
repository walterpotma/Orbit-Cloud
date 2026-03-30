namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        Task RegisterInstallationAsync(string installationId, string githubId);

        Task <IEnumerable> GetRepos();
    }
}