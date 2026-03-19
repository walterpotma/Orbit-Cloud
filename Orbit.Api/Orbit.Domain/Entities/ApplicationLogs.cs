using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class ApplicationLogs : Entity
{
    public long ApplicationId { get; set; }
    public string Content { get; set; }
    public LogType Type { get; set; }
}