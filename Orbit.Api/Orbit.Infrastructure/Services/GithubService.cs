using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly string _appId = "1981006";
        private readonly string _privateKeyPath = "/Orbit.Domain/Enums/orbit-ci-cd.2026-03-30.private-key.pem";
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            await Task.CompletedTask;
        }

        public async Task<IReadOnlyList<Repository>> GetRepositoriesAsync(long installationId = "120231667")
        {
            string privateKey = await File.ReadAllTextAsync(_privateKeyPath);

            var generator = new GitHubJwt.GitHubJwtFactory(
                new GitHubJwt.FilePrivateKeySource(_privateKeyPath),
                new GitHubJwt.GitHubJwtFactoryOptions
                {
                    AppIdentifier = int.Parse(_appId),
                    ExpirationSeconds = 600
                }
            );
            var jwt = generator.CreateEncodedJwt();

            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(jwt, AuthenticationType.Bearer)
            };

            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            var installationClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(response.Token)
            };

            return await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();
        }
    }
}