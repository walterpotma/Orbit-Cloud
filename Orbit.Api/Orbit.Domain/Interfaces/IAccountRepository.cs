using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces;

public interface IAccountRepository
{
    Task<Account?> GetByIdAsync(long id);
    Task<Account?> GetByGithubIdAsync(long githubId);
    Task AddAsync(Account account);
    Task UpdateAsync(Account account);
    Task SaveChangesAsync(); // Opcional no repositório, mas comum no DDD
}