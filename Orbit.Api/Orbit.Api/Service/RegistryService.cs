using Microsoft.Extensions.Logging;
using Orbit.Api.Dto.Registry;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class RegistryService : IRegistryService
    {
        private readonly IRegistryRepository _registryRepository;
        private readonly ILogger<RegistryService> _logger;

        public RegistryService(IRegistryRepository apiRepository, ILogger<RegistryService> logger)
        {
            _registryRepository = apiRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<DtoImage>> ListImagesAsync()
        {
            var repositories = await _registryRepository.GetRepositoriesAsync();
            var tasks = new List<Task<DtoImage>>();

            foreach (var repoName in repositories)
            {
                tasks.Add(Task.Run(async () =>
                {
                    var tags = await _registryRepository.GetTagsAsync(repoName);
                    return new DtoImage
                    {
                        Name = repoName,
                        Tags = tags
                    };
                }));
            }

            var results = await Task.WhenAll(tasks);
            return results;
        }
        public async Task<DtoImage> GetImageAsync(string imageName)
        {
            var tags = await _registryRepository.GetTagsAsync(imageName);
            return new DtoImage
            {
                Name = imageName,
                Tags = tags
            };
        }
        public async Task<bool> DeleteTagAsync(string repositoryName, string tag)
        {
            _logger.LogInformation("Serviço: Processando solicitação para deletar {tag} de {repo}", tag, repositoryName);

            // --- LÓGICA DE NEGÓCIO IRIA AQUI ---
            // Ex: if (user.IsNotAdmin()) { throw new Exception("Não autorizado"); }
            // ------------------------------------

            // Apenas repassa a chamada para a camada de repositório
            return await _registryRepository.DeleteTagAsync(repositoryName, tag);
        }
    }
}