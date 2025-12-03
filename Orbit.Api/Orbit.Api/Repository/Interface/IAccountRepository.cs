using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface IAccountRepository
    {
        string SplitEmail(string email);
        Task<List<Account>> GetAll();
        Task<Account> GetByGithubId(string gitId);
        Task<Account> Create(Account account);
    }
}
