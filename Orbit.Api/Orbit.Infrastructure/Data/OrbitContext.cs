using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;
// Alias para evitar conflito com namespace
using AppEntity = Orbit.Domain.Entities.Application;

namespace Orbit.Infrastructure.Data;

public class OrbitContext : DbContext
{
    public OrbitContext(DbContextOptions<OrbitContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<AppEntity> Applications => Set<AppEntity>();
    public DbSet<ApplicationLogs> ApplicationLogs => Set<ApplicationLogs>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1. Tabela Account
        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("account");
            entity.HasKey(e => e.Id);

            // Mapeando para bater com o banco snake_case
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GithubId).HasColumnName("github_id").IsRequired();
            entity.Property(e => e.GithubUser).HasColumnName("github_user");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // 2. Tabela Application (Note o singular "application" conforme seu print)
        modelBuilder.Entity<AppEntity>(entity =>
        {
            entity.ToTable("application");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GithubId).HasColumnName("github_id");
            entity.Property(e => e.Settings).HasColumnName("application").HasColumnType("jsonb");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // 3. Tabela Application Logs
        modelBuilder.Entity<ApplicationLogs>(entity =>
        {
            entity.ToTable("application_logs");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ApplicationId).HasColumnName("application_id");
            entity.Property(e => e.Content).HasColumnName("logs").HasColumnType("jsonb");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        base.OnModelCreating(modelBuilder);
    }
}