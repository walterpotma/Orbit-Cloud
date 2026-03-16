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
<<<<<<< HEAD

        
=======
>>>>>>> 46e200e59dada911405be8864f060538c2e51027
    }
}