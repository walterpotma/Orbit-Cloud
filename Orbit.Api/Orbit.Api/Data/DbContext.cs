using Microsoft.EntityFrameworkCore;
using Orbit.Api.Model;

namespace Orbit.Api.Data
{
    public class OrbitDbContext : DbContext
    {
        public OrbitDbContext(DbContextOptions<OrbitDbContext> options) : base(options) { }

        public DbSet<Account> Accounts { get; set; }
    }
}
