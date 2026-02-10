namespace Orbit.Application.DTOs.account.cs
{
    public class DtoCreateWorkspace
    {
        public string Username { get; init; }
        public string OwnerType { get; init; }
        public string Email { get; init; }
        public string GithubId { get; init; }

        public int CPU { get; init; }
        public int Memory { get; init; }
    }
}
