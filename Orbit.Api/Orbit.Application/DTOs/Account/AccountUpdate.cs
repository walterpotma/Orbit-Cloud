namespace Orbit.Application.DTOs.Account
{
    public class AccountUpdate
    {
        public long GithubId { get; set; }
        public string GithubUser { get; set; }
        public string Email { get; set; }
        public long GithubAppId { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}