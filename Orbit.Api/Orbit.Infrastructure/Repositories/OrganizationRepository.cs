using Microsoft.EntityFrameworkCore;
using Orbit.Infraestrutura.Persistence;
using Orbit.Domain.Entities;
using Orbit.Application.Interfaces;

namespace Orbit.Infraestrutura.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        public readonly OrbitDbContext _context;

        public OrganizationRepository(OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Organization>> GetAll()
        {
            return await _context.Organizations.ToListAsync();
        }

        public async Task<Organization> GetById(int id)
        {
            return await _context.Organizations.FindAsync(id);
        }

        public async Task<Organization> Create(Organization organization)
        {
            _context.Organizations.Add(organization);
            await _context.SaveChangesAsync();
            return organization;
        }

        public async Task<Organization> Update(Organization organization)
        {
            _context.Entry(organization).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return organization;
        }

        public async Task<bool> Delete(int id)
        {
            var organization = await _context.Organizations.FindAsync(id);
            if (organization == null)
            {
                return false;
            }
            _context.Organizations.Remove(organization);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
