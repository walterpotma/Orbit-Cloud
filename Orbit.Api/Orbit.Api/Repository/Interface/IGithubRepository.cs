using Orbit.Api.Dto;
using Orbit.Api.Model;
using System.Security.Claims;

namespace Orbit.Api.Repository.Interface
{
    public interface IGithubRepository
    {
        Task<string> GetAccessTokenAsync(string code);
        Task<DtoGithub> GetUserFromTokenAsync(string accessToken);
        Task<IEnumerable<DtoGithubRepos>> GetUserRepositoriesAsync(string accessToken);
    }
}
