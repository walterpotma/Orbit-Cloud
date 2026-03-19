using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;

namespace Orbit.Infrastructure.Data;

public class OrbitContext : DbContext
{
    public OrbitContext(DbContextOptions<OrbitContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationLog> ApplicationLogs => Set<ApplicationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuração da Conta
        modelBuilder.Entity<Account>(entity => {
            entity.ToTable("accounts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GithubId).IsRequired();
        });

        // Configuração da Aplicação (Onde o JSON brilha)
        modelBuilder.Entity<Application>(entity => {
            entity.ToTable("applications");
            entity.HasKey(e => e.Id);
            
            // Mapeia o objeto C# como JSONB no Postgres
            entity.Property(e => e.Settings)
                  .HasColumnType("jsonb");
            
            // Relacionamento 1:N com Account
            entity.HasOne<Account>()
                  .WithMany()
                  .HasForeignKey(e => e.AccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuração dos Logs
        modelBuilder.Entity<ApplicationLog>(entity => {
            entity.ToTable("application_logs");
            entity.Property(e => e.Content).HasColumnType("jsonb");
        });

        base.OnModelCreating(modelBuilder);
    }
}