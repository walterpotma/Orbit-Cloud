using Orbit.Application.Interfaces;
using Orbit.Infrastucture.Entities.Github;
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
    }
}