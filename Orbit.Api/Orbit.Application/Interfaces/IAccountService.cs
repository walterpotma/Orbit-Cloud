using Orbit.Application.DTOs.account.cs;

namespace Orbit.Application.Interfaces
{
    public interface IAccountService
    {
        Task <bool> CreateWorkspaceAsync(string githubId);
    }
}
