using k8s.KubeConfigModels;
using Orbit.Api.Dto.account.cs;
using Orbit.Api.Dto.kubernetes;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class AccountService
    {
        public IAccountRepository _repository;
        private readonly IFileSystemService _fileSystemService;
        private readonly IKubernetesService _kubernetesService;

        public AccountService (IAccountRepository repository, IFileSystemService fileSystemService, IKubernetesService kubernetesService)
        {
            _repository = repository;
            _fileSystemService = fileSystemService;
            _kubernetesService = kubernetesService;
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

        public async Task<bool> CreateWorkspaceAsync(string githubId)
        {
            var userBasePath = Path.Combine("fast/users/", githubId);
            try
            {
                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "workspace"));

                await _fileSystemService.CreateDirectoryAsync(Path.Combine(userBasePath, "data"));

                var namespaceRequest = new DtoNamespaceRequest
                {
                    Name = githubId
                };

                await _kubernetesService.CreateNamespacesAsync(namespaceRequest);

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
