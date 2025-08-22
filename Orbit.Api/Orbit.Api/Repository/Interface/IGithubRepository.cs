using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface IGithubRepository
    {
        Task<List<GitRepos>> GetRepository(string accessToken);
    }
}
