using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class TransacionRepository : ITransacionRepository
    {
        public readonly OrbitDbContext _context;

        public TransacionRepository(OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transacion>> GetAll()
        {
            return await _context.Transacions.ToListAsync();
        }

        public async Task<Transacion?> GetById(int id)
        {
            return await _context.Transacions.FindAsync(id);
        }

        public async Task<Transacion> Create(Transacion transacion)
        {
            _context.Transacions.Add(transacion);
            await _context.SaveChangesAsync();
            return transacion;
        }

        public async Task<Transacion>? Update(int id, Transacion transacion)
        {
            var existingTransacion = await _context.Transacions.FindAsync(id);
            if (existingTransacion == null)
            {
                return null;
            }
            _context.Entry(existingTransacion).CurrentValues.SetValues(transacion);
            await _context.SaveChangesAsync();
            return existingTransacion;
        }

        public async Task<bool> Delete(int id)
        {
            var transacion = await _context.Transacions.FindAsync(id);
            if (transacion == null)
            {
                return false;
            }
            _context.Transacions.Remove(transacion);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
