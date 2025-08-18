using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface IAccountRepository
    {
        Task<Account> GetByGithubId(string gitId);
        Task<Account> Create(Account account);
    }
}
