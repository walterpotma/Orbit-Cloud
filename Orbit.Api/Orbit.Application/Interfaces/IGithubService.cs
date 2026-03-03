using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Application.Interfaces
{
    public class IGithubService
    {
        Task<IEnumerable<DtoGithubReposResponse>> GetCurrentUserRepositoriesAsync();
    }
}