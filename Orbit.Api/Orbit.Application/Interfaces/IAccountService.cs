using Orbit.Application.DTOs.Account;
using Orbit.Domain.Entities;

namespace Orbit.Application.Interfaces
{
    public interface IAccountService
    {
        Task <bool> CreateWorkspaceAsync(long githubId, string userName, string email);
        Task <Account> GetAccountByGithubIdAsync(long githubId);
        Task<Account?> UpdateByGithubIdAsync(long githubId, AccountUpdate account);
    }
}
