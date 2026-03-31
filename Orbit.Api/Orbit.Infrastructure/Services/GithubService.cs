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

        public async Task<IReadOnlyList<Octokit.Repository>> GetRepositoriesAsync(long installationId)
        {
            // 1. Gerar o JWT (Ajustado para os nomes corretos da lib GitHubJwt)
            var generator = new GitHubJwtFactory(
                new FilePrivateKeySource(_privateKeyPath),
                new GitHubJwtFactoryOptions
                {
                    AppId = int.Parse(_appId), // Mudou de AppIdentifier para AppId
                    ExpirationSeconds = 600
                }
            );

            // O método correto costuma ser CreateJwt() ou similar dependendo da versão
            var jwt = generator.CreateJwt();

            // 2. Criar o cliente como App
            var appClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                // Ajuste: Credentials para Bearer Token no Octokit
                Credentials = new Credentials(jwt)
            };

            // 3. Gerar Token de Instalação
            var response = await appClient.GitHubApps.CreateInstallationToken(installationId);

            // 4. Criar o cliente como Instalação
            var installationClient = new GitHubClient(new ProductHeaderValue("OrbitCloud"))
            {
                Credentials = new Credentials(response.Token)
            };

            // 5. Ajuste no retorno: GetAllRepositoriesForCurrent retorna um RepositoriesResponse
            // Precisamos acessar a propriedade .Repositories que é a IReadOnlyList
            var reposResponse = await installationClient.GitHubApps.Installation.GetAllRepositoriesForCurrent();

            return reposResponse.Repositories;
        }
    }
}