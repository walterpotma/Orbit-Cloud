namespace Orbit.Domain.Entities;

public abstract class Entity
{
    public long Id { get; protected set; }
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}