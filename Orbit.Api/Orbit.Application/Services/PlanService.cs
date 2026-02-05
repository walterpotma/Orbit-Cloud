using Orbit.Application.DTOs.Subscription;
using Orbit.Domain.Interfaces;

namespace Orbit.Api.Service
{
    public class PlanService
    {
        public IPlanRepository _planRepository;

        public PlanService(IPlanRepository planRepository)
        {
            _planRepository = planRepository;
        }

        public Task<List<DtoPlan>> GetPlans()
        {
            return _planRepository.GetAll().ContinueWith(t => t.Result.Select(p => new DtoPlan
            {
                Id = p.Id,
                Name = p.Name
            }).ToList());
        }
        public Task<DtoPlan> GetPlanById(int id)
        {
            return _planRepository.GetById(id).ContinueWith(t =>
            {
                var p = t.Result;
                if (p == null) return null;
                return new DtoPlan
                {
                    Id = p.Id,
                    Name = p.Name
                };
            });
        }
        public Task<DtoPlan> GetPlanByName(string name)
        {
            return _planRepository.GetByName(name).ContinueWith(t =>
            {
                var p = t.Result;
                if (p == null) return null;
                return new DtoPlan
                {
                    Id = p.Id,
                    Name = p.Name
                };
            });
        }

        public Task<DtoPlan> CreatePlan(DtoPlan dtoPlan)
        {
            var plan = new Orbit.Api.Model.Plan
            {
                Name = dtoPlan.Name
            };
            return _planRepository.Create(plan).ContinueWith(t =>
            {
                var p = t.Result;
                return new DtoPlan
                {
                    Id = p.Id,
                    Name = p.Name
                };
            });
        }
        public Task<DtoPlan> UpdatePlan(DtoPlan dtoPlan)
        {
            return _planRepository.GetById(dtoPlan.Id).ContinueWith(t =>
            {
                var p = t.Result;
                if (p == null) return null;
                p.Name = dtoPlan.Name;
                return _planRepository.Update(p).ContinueWith(t2 =>
                {
                    var updatedPlan = t2.Result;
                    return new DtoPlan
                    {
                        Id = updatedPlan.Id,
                        Name = updatedPlan.Name
                    };
                });
            }).Unwrap();
        }
        public Task<bool> DeletePlan(int id)
        {
            return _planRepository.Delete(id);
        }
    }
}
