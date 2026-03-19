using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class AppLogs : Entity
{
    public long AppId { get; set; }
    public string Content { get; set; }
    public LogType Type { get; set; }
}