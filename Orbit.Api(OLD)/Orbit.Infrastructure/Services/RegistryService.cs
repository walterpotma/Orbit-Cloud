using Microsoft.Extensions.Logging;
using Orbit.Application.DTOs.Registry;
using Orbit.Domain.Interfaces;
using Orbit.Application.Interfaces;

namespace Orbit.Infrastructure.Services
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
            return await _registryRepository.DeleteTagAsync(repositoryName, tag);
        }
        public async Task<IEnumerable<DtoImage>> ListImagesByUserAsync(string githubId)
        {
            var allRepositories = await _registryRepository.GetRepositoriesAsync();

            string prefixoUsuario = $"{githubId}/";

            var userRepositories = allRepositories
                                    .Where(r => r.StartsWith(prefixoUsuario))
                                    .ToList();

            var tasks = new List<Task<DtoImage>>();

            foreach (var repoName in userRepositories)
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
    }
}