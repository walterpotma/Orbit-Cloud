using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;
namespace Orbit.Infrastructure.Data;

public class OrbitContext : DbContext
{
    public OrbitContext(DbContextOptions<OrbitContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<App> Apps => Set<App>();
    public DbSet<AppLogs> AppLogs => Set<AppLogs>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.ToTable("account");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GithubId).HasColumnName("github_id").IsRequired();
            entity.Property(e => e.GithubUser).HasColumnName("github_user");
            entity.Property(e => e.Email).HasColumnName("email");
            // entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            // entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<App>(entity =>
        {
            entity.ToTable("app");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GithubId).HasColumnName("github_id");
            entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
            // entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            // entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<AppLogs>(entity =>
        {
            entity.ToTable("app_logs");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ApplicationId).HasColumnName("app_id");
            entity.Property(e => e.Content).HasColumnName("logs").HasColumnType("jsonb");
            // entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            // entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        base.OnModelCreating(modelBuilder);
    }
}