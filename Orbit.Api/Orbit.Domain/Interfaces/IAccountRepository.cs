using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces
{
    public interface IAccountRepository
    {
        string SplitEmail(string email);
        Task<List<Account>> GetAll();
        Task<Account> GetByGithubId(string gitId);
        Task<Account> Create(Account account);
    }
}
