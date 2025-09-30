using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly OrbitDbContext _context;

        public AccountRepository (OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Account>> GetAll ()
        {
            return await _context.Accounts.ToListAsync();
        }

        public async Task<Account> GetByGithubId (string githubId)
        {
            return await _context.Accounts.FirstOrDefaultAsync(x => x.GithubId == githubId);
        }

        public async Task<Account> Create (Account account)
        {
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return account;
        }
    }
}
