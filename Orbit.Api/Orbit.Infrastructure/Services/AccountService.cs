using System.Diagnostics;
using Microsoft.VisualBasic;
using Orbit.Application.DTOs.kubernetes;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Infrastructure.Services
{
    public class AccountService : IAccountService
    {
        private readonly IFileSystemService _fileSystemService;
        private readonly IAccountRepository _accountRepository;
        private readonly IKubernetesService _kubernetesService;

        public AccountService(
            IFileSystemService fileSystemService,
            IKubernetesService kubernetesService,
            IAccountRepository accountRepository)
        {
            _fileSystemService = fileSystemService;
            _kubernetesService = kubernetesService;
            _accountRepository = accountRepository;
        }

        public async Task<bool> CreateWorkspaceAsync(long githubId, string userName, string email)
        {
            var userBasePath = Path.Combine("archive/clients/", githubId);
            var namespaceName = $"u-{githubId}";

            try
            {
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "workspace"));
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "data"));

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

                try
                {
                    var existingAccount = await _accountRepository.GetByGithubIdAsync(githubId);

                    if (existingAccount == null)
                    {
                        var newAccount = new Account(githubId, userName, email);
                        await _accountRepository.AddAsync(newAccount);
                    }

                    await _accountRepository.SaveChangesAsync();
                    return true;
                }
                catch (Exception error)
                {
                    Console.WriteLine($"[FAIL] Erro no banco: {error.Message}");
                    return false;
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