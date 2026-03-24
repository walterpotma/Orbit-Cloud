using Orbit.Application.DTOs.account.cs;
using Orbit.Domain.Entities;

namespace Orbit.Application.Interfaces
{
    public interface IAccountService
    {
        Task <bool> CreateWorkspaceAsync(long githubId, string userName, string email);
        Task <Account> GetAccountByGithubIdAsync(long githubId);
    }
}
