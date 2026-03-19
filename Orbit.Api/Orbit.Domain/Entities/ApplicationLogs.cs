public class ApplicationLog : Entity
{
    public long ApplicationId { get; private set; }
    public string Content { get; private set; }
    public LogType Type { get; private set; }
}