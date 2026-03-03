using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public interface IGithubService
    {
        Task<IEnumerable<DtoGithubReposResponse>> GetCurrentUserRepositoriesAsync();
    }
}