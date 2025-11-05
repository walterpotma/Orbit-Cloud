using Orbit.Api.Dto.Registry;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class RegistryService : IRegistryService
    {
        private readonly IRegistryRepository _apiRepository;

        public RegistryService(IRegistryRepository apiRepository)
        {
            _apiRepository = apiRepository;
        }

        public async Task<IEnumerable<DtoImage>> ListImagesAsync()
        {
            var repositories = await _apiRepository.GetRepositoriesAsync();
            var tasks = new List<Task<DtoImage>>();

            foreach (var repoName in repositories)
            {
                tasks.Add(Task.Run(async () =>
                {
                    var tags = await _apiRepository.GetTagsAsync(repoName);
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