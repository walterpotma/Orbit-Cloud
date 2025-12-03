using Orbit.Api.Dto.account.cs;
using Orbit.Api.Model;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class AccountService
    {
        public IAccountRepository _repository;

        public AccountService (IAccountRepository repository) {
            _repository = repository;
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
    }
}
