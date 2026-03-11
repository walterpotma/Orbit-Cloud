using LibGit2Sharp;
using Orbit.Infrastucture.Entities.Github;
using Orbit.Domain.Interfaces;
using Orbit.Application.Mappers;
using Orbit.Application.Interfaces;

namespace Orbit.Infrastructure.Repository
{
    public class GithubRepository : IGithubRepository
    {
        private readonly MapperGithub _mapper;

        public GithubRepository(MapperGithub mapper)
        {
            _mapper = mapper;
        }
    }
}