using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;
using System.Text.RegularExpressions;

namespace Orbit.Api.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly OrbitDbContext _context;

        public AccountRepository (OrbitDbContext context)
        {
            _context = context;
        }

        public string SplitEmail (string email)
        {
            string slug = email.ToLowerInvariant();

            slug = slug.Replace("@", "-at-");

            slug = Regex.Replace(slug, @"[^a-z0-9]", "-");

            slug = Regex.Replace(slug, @"-+", "-");

            slug = slug.Trim('-');

            if (slug.Length > 63)
            {
                var hash = email.GetHashCode().ToString("x");
                slug = slug.Substring(0, 63 - hash.Length - 1) + "-" + hash;
            }

            return slug;
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
