using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        public readonly OrbitDbContext _context;

        public SubscriptionRepository(OrbitDbContext context)
        {
            _context = context;
        }

        public async Task<List<Subscription>> GetAll()
        {
            return await _context.Subscriptions.ToListAsync();
        }

        public async Task<Subscription> GetById(int id)
        {
            return await _context.Subscriptions.FindAsync(id);
        }

        public async Task<Subscription> Create(Subscription subscription)
        {
            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscription> Update(Subscription subscription)
        {
            _context.Subscriptions.Update(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<bool> Delete(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);
            if (subscription == null)
            {
                return false;
            }
            _context.Subscriptions.Remove(subscription);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
