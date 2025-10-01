using Orbit.Api.Dto;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class RuleService
    {
        public IRuleRepository _ruleRepository;

        public RuleService(IRuleRepository ruleRepository)
        {
            _ruleRepository = ruleRepository;
        }

        public Task<List<DtoRule>> GetAll()
        {
            return _ruleRepository.GetAll().ContinueWith(t => t.Result.Select(r => new DtoRule
            {
                Id = r.Id,
                AccountId = r.AccountId,
                OrganizationId = r.OrganizationId,
                Access = r.Access
            }).ToList());
        }

        public Task<DtoRule> GetById(int id)
        {
            return _ruleRepository.GetById(id).ContinueWith(t =>
            {
                var r = t.Result;
                if (r == null) return null;
                return new DtoRule
                {
                    Id = r.Id,
                    AccountId = r.AccountId,
                    OrganizationId = r.OrganizationId,
                    Access = r.Access
                };
            });
        }

        public Task<DtoRule> Create(DtoRule dtoRule)
        {
            var rule = new Orbit.Api.Model.Rule
            {
                AccountId = dtoRule.AccountId,
                OrganizationId = dtoRule.OrganizationId,
                Access = dtoRule.Access
            };
            return _ruleRepository.Create(rule).ContinueWith(t =>
            {
                var r = t.Result;
                return new DtoRule
                {
                    Id = r.Id,
                    AccountId = r.AccountId,
                    OrganizationId = r.OrganizationId,
                    Access = r.Access
                };
            });
        }

        public Task<DtoRule> Update(DtoRule dtoRule)
        {
            var rule = new Orbit.Api.Model.Rule
            {
                Id = dtoRule.Id,
                AccountId = dtoRule.AccountId,
                OrganizationId = dtoRule.OrganizationId,
                Access = dtoRule.Access
            };
            return _ruleRepository.Update(rule).ContinueWith(t =>
            {
                var r = t.Result;
                return new DtoRule
                {
                    Id = r.Id,
                    AccountId = r.AccountId,
                    OrganizationId = r.OrganizationId,
                    Access = r.Access
                };
            });
        }

        public Task<bool> Delete(int id)
        {
            return _ruleRepository.Delete(id);
        }
    }
}
