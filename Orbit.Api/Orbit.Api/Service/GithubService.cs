using Orbit.Api.Dto_s;
using Orbit.Api.Model;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class GithubService
    {
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task<List<DtoGitRepos>> GetRepositoriesAsync(string accessToken)
        {
            var repos = await _githubRepository.GetRepository(accessToken);

            return repos.Select(r => new DtoGitRepos
            {
                Name = r.Name,
                Url = r.Url
            }).ToList();
        }
    }
}
