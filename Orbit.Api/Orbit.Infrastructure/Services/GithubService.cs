using Octokit;
using GitHubJwt;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Services
{
    public class GithubService : IGithubService
    {
        private readonly string _appId = "1981006";
        // Dica: Mantenha a chave na raiz do projeto ou em uma pasta segura e use caminhos relativos ao AppContext
        private readonly string _privateKeyPath = Path.Combine(AppContext.BaseDirectory, "orbit-ci-cd.private-key.pem");
        private readonly IGithubRepository _githubRepository;

        public GithubService(IGithubRepository githubRepository)
        {
            _githubRepository = githubRepository;
        }

        public async Task RegisterInstallationAsync(string installationId, string githubId)
        {
            // Aqui você salvaria no banco a relação entre o User e a Instalação do App
            await Task.CompletedTask;
        }

        public async Task<IReadOnlyList<Repository>> GetRepositoriesAsync(long installationId)
        {
            // 1. Gerar o JWT para se autenticar como o App
            var generator = new GitHubJwtFactory(
                new FilePrivateKeySource(_privateKeyPath),
                new GitHubJwtFactoryOptions
                {
                    AppIdentifier = int.Parse(_appId),
                    ExpirationSeconds = 600 // 10 minutos
                }
            );

            var jwt = generator.CreateEncodedJwt();

            // 2. Criar o cliente como App
            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(jwt, AuthenticationType.Bearer)
            };

            // 3. Gerar Token de Instalação (Isso permite acessar os repositórios que o user deu permissão)
            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            // 4. Criar o cliente como Instalação
            var installationClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(response.Token)
            };

            // 5. Retornar todos os repositórios daquela instalação
            return await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();
        }
    }
}