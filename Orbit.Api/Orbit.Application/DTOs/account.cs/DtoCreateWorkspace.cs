namespace Orbit.Api.Dto.account.cs
{
    public class DtoCreateWorkspace
    {
        public string Username { get; init; }  // "walterpotma"
        public string OwnerType { get; init; } // "User" ou "Org"
        public string Email { get; init; }     // Para logs ou notificações
        public string GithubId { get; init; }

        public int CPU { get; init; }         // Em millicores (1000 = 1 core)
        public int Memory { get; init; }      // Em MB
    }
}
