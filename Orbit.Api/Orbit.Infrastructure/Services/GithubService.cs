using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            await Task.CompletedTask;
        }
    }
}