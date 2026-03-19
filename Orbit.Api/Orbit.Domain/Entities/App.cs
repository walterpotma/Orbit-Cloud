namespace Orbit.Domain.Entities;

public class App : Entity
{
    public long GithubId { get; private set; }
    public AppSettings Settings { get; private set; } 

    // public void Deploy(string branch) 
    // {
    //     // Lógica para disparar o evento de build
    // }
}
public record AppSettings(string Runtime, string BuildCommand, int MemoryLimit);