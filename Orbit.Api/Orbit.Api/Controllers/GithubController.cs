using Orbit.Application.Interfaces;
using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    [Route("[controller]")]
    [ApiController]
    public class GithubService : IGithubService
    {
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        [HttpGet("repos")]
        public async Task<IEnumerable<DtoGithubReposResponse>> GetCurrentUserRepositoriesAsync()
        {
            return await _githubRepository.GetUserRepositoriesAsync();
        }
    }
}