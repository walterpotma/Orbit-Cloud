using Orbit.Api.Dto.account.cs;

namespace Orbit.Api.Service.Interface
{
    public interface IAccountService
    {
        string SplitEmail(string email);

        Task <bool> CreateWorkspaceAsync(string githubId);
    }
}
