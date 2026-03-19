using Microsoft.EntityFrameworkCore;
// Usando um Alias para evitar confusão com o Namespace do projeto
using AppEntity = Orbit.Domain.Entities.Application;
using Orbit.Domain.Entities;

namespace Orbit.Infrastructure.Data;

public class OrbitContext : DbContext
{
    public OrbitContext(DbContextOptions<OrbitContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    
    // Aqui usamos o Alias 'AppEntity' para o compilador não confundir com o namespace Orbit.Application
    public DbSet<AppEntity> Applications => Set<AppEntity>();
    
    // Verifique se o nome da classe é ApplicationLogs ou ApplicationLog (no seu erro estava Logs no plural)
    public DbSet<ApplicationLogs> ApplicationLogs => Set<ApplicationLogs>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity => {
            entity.ToTable("accounts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GithubId).IsRequired();
        });

        // Usamos o nome completo aqui também
        modelBuilder.Entity<AppEntity>(entity => {
            entity.ToTable("applications");
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Settings)
                  .HasColumnType("jsonb");
            
            entity.HasOne<Account>()
                  .WithMany()
                  .HasForeignKey(e => e.AccountId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationLogs>(entity => {
            entity.ToTable("application_logs");
            // Se o campo no C# for string, o Postgres aceita jsonb suave
            entity.Property(e => e.Content).HasColumnType("jsonb");
        });

        base.OnModelCreating(modelBuilder);
    }
}