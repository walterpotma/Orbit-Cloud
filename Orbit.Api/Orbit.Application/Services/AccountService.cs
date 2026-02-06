using Orbit.Application.DTOs.kubernetes;
using Orbit.Application.Interfaces;

namespace Orbit.Application.Services
{
    public class AccountService : IAccountService
    {
        private readonly IFileSystemService _fileSystemService;
        private readonly IKubernetesService _kubernetesService;

        public AccountService(
            IFileSystemService fileSystemService,
            IKubernetesService kubernetesService)
        {
            _fileSystemService = fileSystemService;
            _kubernetesService = kubernetesService;
        }

        public async Task<bool> CreateWorkspaceAsync(string githubId)
        {
            var userBasePath = Path.Combine("archive/clients/", githubId);
            var namespaceName = $"u-{githubId}";

            try
            {
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "workspace"));
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "data"));
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "registry"));

                try
                {
                    await _kubernetesService.GetNamespacesAsync(namespaceName);
                    Console.WriteLine($"[Info] Workspace (Namespace) '{namespaceName}' já existe. Pulando criação.");
                }
                catch
                {
                    var namespaceRequest = new DtoNamespaceRequest
                    {
                        Name = namespaceName
                    };
                    await _kubernetesService.CreateNamespacesAsync(namespaceRequest);
                    Console.WriteLine($"[Success] Namespace '{namespaceName}' criado com sucesso.");
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Falha crítica ao criar workspace: {ex.Message}");
                return false;
            }
        }
    }
}