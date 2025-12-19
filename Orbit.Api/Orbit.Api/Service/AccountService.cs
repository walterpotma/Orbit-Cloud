using k8s.KubeConfigModels;
using Orbit.Api.Dto.account.cs;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class AccountService
    {
        public IAccountRepository _repository;
        private readonly IFileSystemService _fileSystemService;

        public AccountService (IAccountRepository repository, IFileSystemService fileSystemService) {
            _repository = repository;
            _fileSystemService = fileSystemService;
        }

        public string SplitEmail()
        {
            return _repository.SplitEmail("walterpotma@gmail.com");
        }

        public async Task<List<DtoAccount>> GetAll()
        {
            var response = await _repository.GetAll();
            return response.Select(x => new DtoAccount
            {
                Id = x.Id,
                GithubId = x.GithubId,
                Name = x.Name,
                Email = x.Email
            }).ToList();
        }

        public async Task<DtoAccount> GetByGitIdOrCreate(string gitId, string name, string email)
        {
            var response = await _repository.GetByGithubId(gitId);

            if (response != null)
            {
                return new DtoAccount
                {
                    Id = response.Id,
                    GithubId = response.GithubId,
                    Name = response.Name,
                    Email = response.Email
                };
            }

            var account = new Account
            { 
                Id = 0,
                GithubId = gitId,
                Name = name,
                Email = email
            };

            var created = await _repository.Create(account);

            return new DtoAccount
            {
                Id = created.Id,
                GithubId = created.GithubId,
                Name = created.Name,
                Email = created.Email
            };
        }

        public async Task<bool> CreateWorkspaceAsync(DtoCreateWorkspace workspace)
        {
            if (workspace == null) return false;

            var safeUsername = workspace.Username.Trim().ToLowerInvariant();
            var ownerTypeFolder = workspace.OwnerType.Equals("Org", StringComparison.OrdinalIgnoreCase) ? "organizations" : "users";

            var userBasePath = Path.Combine("fast", ownerTypeFolder, safeUsername);

            try
            {
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "workspace"));

                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "data"));

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Falha ao criar workspace: {ex.Message}");
                return false;
            }
        }
    }
}
