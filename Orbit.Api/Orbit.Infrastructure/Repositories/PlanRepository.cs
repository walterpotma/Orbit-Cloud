using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class PlanRepository : IPlanRepository
    {
        public readonly OrbitDbContext _context;
        
        public PlanRepository(OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Plan>> GetAll()
        {
            return await _context.Plans.ToListAsync();
        }

        public async Task<Plan> GetById(int id)
        {
            return await _context.Plans.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Plan> GetByName(string name)
        {
            return await _context.Plans.FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<Plan> Create(Plan plan)
        {
            _context.Plans.Add(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task<Plan> Update(Plan plan)
        {
            _context.Plans.Update(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task<bool> Delete(int id)
        {
            var plan = await _context.Plans.FirstOrDefaultAsync(p => p.Id == id);
            if (plan == null)
            {
                return false;
            }
            _context.Plans.Remove(plan);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
