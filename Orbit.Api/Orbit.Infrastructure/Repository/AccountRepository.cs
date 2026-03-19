using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Data;

namespace Orbit.Infrastructure.Repository;

public class AccountRepository : IAccountRepository
{
    private readonly OrbitContext _context;

    public AccountRepository(OrbitContext context)
    {
        _context = context;
    }

    public async Task<Account?> GetByIdAsync(long id)
    {
        return await _context.Accounts.FindAsync(id);
    }

    public async Task<Account?> GetByGithubIdAsync(long githubId)
    {
        // Busca o Walter pelo ID do GitHub dele
        return await _context.Accounts
            .FirstOrDefaultAsync(a => a.GithubId == githubId);
    }

    public async Task AddAsync(Account account)
    {
        await _context.Accounts.AddAsync(account);
    }

    public async Task UpdateAsync(Account account)
    {
        _context.Accounts.Update(account);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}