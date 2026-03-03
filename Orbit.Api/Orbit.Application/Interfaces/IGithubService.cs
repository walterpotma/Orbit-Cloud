using Orbit.Application.DTOs.Github;

namespace Orbit.Application.Interfaces
{
    public class IGithubService
    {
        Task<IEnumerable<DtoGithubReposResponse>> GetCurrentUserRepositoriesAsync();
    }
}