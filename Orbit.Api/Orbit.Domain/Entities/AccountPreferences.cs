public class AccountPreferences : Entity
{
    public long GithubId { get; private set; }
    public string WebPreferences { get; private set; }
    public string BuildPreferences { get; private set; }
    public string DeployPreferences { get; private set; }
}