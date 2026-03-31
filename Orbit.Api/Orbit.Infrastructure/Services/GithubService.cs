using Octokit;
using GitHubJwt;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Repository = Octokit.Repository;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly string _appId = "1981006";
        private readonly string _privateKeyPath = Path.Combine(AppContext.BaseDirectory, "orbit-ci-cd.private-key.pem");
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            await Task.CompletedTask;
        }

        public async Task<IReadOnlyList<Octokit.Repository>> GetRepositoriesAsync(long installationId)
        {
            // 1. Gerar o JWT 
            // Se 'AppId' ou 'AppIdentifier' falharem, use 'AppIdentifier' (nome mais comum em versões estáveis)
            var generator = new GitHubJwtFactory(
                new FilePrivateKeySource(_privateKeyPath),
                new GitHubJwtFactoryOptions
                {
                    AppIdentifier = int.Parse(_appId), // Volte para AppIdentifier
                    ExpirationSeconds = 600
                }
            );

            // Se 'CreateJwt()' não existir, o nome correto na sua versão deve ser 'CreateEncodedJwt()'
            var jwt = generator.CreateEncodedJwt();

            // 2. Criar o cliente como App
            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(jwt, AuthenticationType.Bearer)
            };

            // 3. Gerar Token de Instalação
            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            // 4. Criar o cliente como Instalação
            var installationClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(response.Token)
            };

            // 5. Retornar a lista de repositórios do envelope de resposta
            var reposResponse = await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();

            return reposResponse.Repositories;
        }
    }
}