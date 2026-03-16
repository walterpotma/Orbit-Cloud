namespace Orbit.Infrastructure.Service
{
    public class GithubAuthService : IGithubAuthService
    {
        private readonly IConfiguration _config;
        public GithubAuthService(IConfiguration config) => _config = config;

        public string GenerateJwt()
        {
            var privateKeyPath = _config["GithubApp:PrivateKeyPath"];
            string pemContent = File.ReadAllText(privateKeyPath);
            
            return "JWT_ASSINADO";
        }
    }
}