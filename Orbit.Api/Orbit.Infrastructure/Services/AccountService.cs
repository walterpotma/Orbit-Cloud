using System.Diagnostics;
using Microsoft.VisualBasic;
using Orbit.Application.DTOs.kubernetes;
using Orbit.Application.DTOs.Account;
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
            var userBasePath = Path.Combine("archive/clients/", githubId.ToString());
            var namespaceName = $"u-{githubId}";

            try
            {
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "workspace"));
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "data"));

                try
                {
                    var existingAccount = await _accountRepository.GetByGithubIdAsync(githubId);

                    if (existingAccount == null)
                    {
                        var newAccount = new Account(githubId, userName, email, null);
                        await _accountRepository.AddAsync(newAccount);
                    }

                    await _accountRepository.SaveChangesAsync();
                    return true;
                }
                catch (Exception error)
                {
                    Console.WriteLine($"[FAIL] Erro no banco: {error.Message}");
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Falha crítica ao criar workspace: {ex.Message}");
                return false;
            }
        }

        public async Task<Account?> GetAccountByGithubIdAsync(long githubId)
        {
            if (string.IsNullOrEmpty(githubId.ToString())) return null;

            var existingAccount = await _accountRepository.GetByGithubIdAsync(githubId);

            return existingAccount;
        }

        public async Task<Account?> UpdateByGithubIdAsync(long githubId, AccountUpdate account)
        {
            var existingAccount = await _accountRepository.GetByGithubIdAsync(githubId);

            if (existingAccount == null) return null;

            existingAccount.GithubUser = account.GithubUser;
            existingAccount.Email = account.Email;

            existingAccount.GithubAppId = account.GithubAppId;

            existingAccount.UpdatedAt = DateTime.UtcNow;

            await _accountRepository.UpdateAsync(existingAccount);
            await _accountRepository.SaveChangesAsync();

            return existingAccount;
        }
    }
}