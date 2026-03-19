namespace Orbit.Domain.Entities;

public class App : Entity
{
    public long AccountId { get; private set; }
    
    // As "Preferences" do seu banco entram aqui como Value Objects (JSON no banco)
    public AppSettings Settings { get; private set; } 

    public void Deploy(string branch) 
    {
        // Lógica para disparar o evento de build
    }
}

public record AppSettings(string Runtime, string BuildCommand, int MemoryLimit);