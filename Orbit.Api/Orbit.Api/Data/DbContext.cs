using Microsoft.EntityFrameworkCore;
using Orbit.Api.Model;

namespace Orbit.Api.Data
{
    public class OrbitDbContext : DbContext
    {
        public OrbitDbContext(DbContextOptions<OrbitDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Rule> Rules { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Transacion> Transacions { get; set; }
    }
}
