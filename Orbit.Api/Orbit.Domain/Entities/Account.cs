namespace Orbit.Domain.Entities;

public class Account : Entity
{
    public long GithubId { get; set; }
    public string GithubUser { get; set; }
    public string Email { get; set; }

    // Este é o construtor que o Service está procurando
    public Account(long githubId, string githubUser, string email)
    {
        GithubId = githubId;
        GithubUser = githubUser;
        Email = email;
        CreatedAt = DateTime.UtcNow;
    }

    // O Entity Framework exige um construtor vazio (pode ser protected)
    protected Account() { }
}