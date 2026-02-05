using Orbit.Application.DTOs.account.cs;

namespace Orbit.Application.Interfaces
{
    public interface IAccountService
    {
        string SplitEmail(string email);

        Task <bool> CreateWorkspaceAsync(string githubId);
    }
}
