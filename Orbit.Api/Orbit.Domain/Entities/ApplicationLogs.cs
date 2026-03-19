using Orbit.Domain.Enums; // <--- ADICIONE ISSO
using Orbit.Domain.Entities;

public class ApplicationLogs : Entity
{
    public long ApplicationId { get; private set; }
    public string Content { get; private set; }
    public LogType Type { get; private set; }
}