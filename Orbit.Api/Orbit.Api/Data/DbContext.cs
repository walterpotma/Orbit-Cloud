using Microsoft.EntityFrameworkCore;
using Orbit.Api.Model;

namespace Orbit.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("account"); // nome da tabela no banco

                entity.HasKey(e => e.Id); // chave primária

                entity.Property(e => e.Name)
                      .HasColumnName("name")
                      .HasMaxLength(100);

                entity.Property(e => e.Email)
                      .HasColumnName("email")
                      .HasMaxLength(200);

                entity.Property(e => e.Plano)
                      .HasColumnName("plano")
                      .HasMaxLength(50);
            });
        }
    }
}
