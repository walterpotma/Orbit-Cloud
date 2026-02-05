using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;

namespace Orbit.Infraestructure.Persistence
{
    public class OrbitDbContext : DbContext
    {
        public OrbitDbContext(DbContextOptions<OrbitDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Rule> Rules { get; set; }
    }
}
