using Orbit.Api.Dto.Registry;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class RegistryService : IRegistryService
    {
        private readonly IRegistryRepository _imageRepository;
        private readonly string _registryUrl;

        public RegistryService(IRegistryService imageRepository, IConfiguration configuration)
        {
            _imageRepository = (IRegistryRepository?)imageRepository;
            // Pega a URL do registry sem "http://" para usar na tag da imagem
            var fullUrl = configuration["DockerRegistry:Url"] ?? "http://localhost:5000";
            _registryUrl = new Uri(fullUrl).Host + ":" + new Uri(fullUrl).Port;
        }

        public async Task<IEnumerable<DtoImage>> ListImagesAsync()
        {
            var repositories = await _imageRepository.GetRepositoriesAsync();
            var imageList = new List<DtoImage>();

            foreach (var repoName in repositories)
            {
                var tags = await _imageRepository.GetTagsAsync(repoName);
                imageList.Add(new DtoImage
                {
                    Name = repoName,
                    Tags = tags
                });
            }
            return imageList;
        }

        public async Task<DtoImage> BuildAndPushImageAsync(DtoImageBuild request)
        {
            // 1. Monta o nome completo da imagem: 192.168.100.21:5000/meu-app:latest
            var fullImageName = $"{_registryUrl}/{request.ImageName}";
            var fullImageNameWithTag = $"{fullImageName}:{request.Tag}";

            // 2. Manda o repositório construir
            await _imageRepository.BuildImageAsync(request.BuildContextPath, request.DockerfilePath, fullImageNameWithTag);

            // 3. Manda o repositório enviar para o registry
            await _imageRepository.PushImageAsync(fullImageNameWithTag);

            // 4. Retorna o DTO do que foi criado
            return new DtoImage
            {
                Name = request.ImageName,
                Tags = new List<string> { request.Tag }
            };
        }
    }
}
