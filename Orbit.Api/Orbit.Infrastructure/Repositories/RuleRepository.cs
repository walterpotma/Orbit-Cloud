using Microsoft.EntityFrameworkCore;
using Orbit.Infraestrutura.Persistence;
using Orbit.Domain.Entities;
using Orbit.Application.Interfaces;

namespace Orbit.Infraestrutura.Repositories
{
    public class RuleRepository : IRuleRepository
    {
        public readonly OrbitDbContext _context;

        public RuleRepository(OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Rule>> GetAll()
        {
            return await _context.Rules.ToListAsync();
        }

        public async Task<Rule> GetById(int id)
        {
            return await _context.Rules.FindAsync(id);
        }

        public async Task<Rule> Create(Rule rule)
        {
            _context.Rules.Add(rule);
            await _context.SaveChangesAsync();
            return rule;
        }
        public async Task<Rule> Update(Rule rule)
        {
            _context.Rules.Update(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<bool> Delete(int id)
        {
            var rule = await _context.Rules.FindAsync(id);
            if (rule == null)
            {
                return false;
            }
            _context.Rules.Remove(rule);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
