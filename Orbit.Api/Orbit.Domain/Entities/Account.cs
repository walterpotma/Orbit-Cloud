namespace Orbit.Domain.Entities;

public class Account : Entity
{
    public long GithubId { get; private set; }
    public string GithubUser { get; private set; }
    public string Email { get; private set; }

    public void UpdateEmail(string newEmail) 
    {
        this.Email = newEmail;
    }
}