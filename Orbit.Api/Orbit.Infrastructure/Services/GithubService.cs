using Orbit.Application.Interfaces;
using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public class GithubService : IGithubService
    {
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task<IEnumerable<DtoGithubReposResponse>> GetCurrentUserRepositoriesAsync()
        {
            return await _githubRepository.GetUserRepositoriesAsync();
        }
    }
}