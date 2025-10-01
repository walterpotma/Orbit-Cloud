using Orbit.Api.Dto;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class SubscriptionService
    {
        public readonly ISubscriptionRepository _subscriptionRepository;

        public SubscriptionService(ISubscriptionRepository subscriptionRepository)
        {
            _subscriptionRepository = subscriptionRepository;
        }

        public async Task<List<DtoSubscription>> GetSubscriptions()
        {
            var subscriptions = await _subscriptionRepository.GetAll();
            return subscriptions.Select(s => new DtoSubscription
            {
                Id = s.Id,
                PlanId = s.PlanId
            }).ToList();
        }
        
        public async Task<DtoSubscription?> GetSubscriptionById(int id)
        {
            var s = await _subscriptionRepository.GetById(id);
            if (s == null) return null;
            return new DtoSubscription
            {
                Id = s.Id,
                PlanId = s.PlanId
            };
        }

        public async Task<DtoSubscription> CreateSubscription(DtoSubscription dtoSubscription)
        {
            var subscription = new Orbit.Api.Model.Subscription
            {
                PlanId = dtoSubscription.PlanId
            };
            var s = await _subscriptionRepository.Create(subscription);
            return new DtoSubscription
            {
                Id = s.Id,
                PlanId = s.PlanId
            };
        }

        public async Task<DtoSubscription?> UpdateSubscription(DtoSubscription dtoSubscription)
        {
            var existingSubscription = await _subscriptionRepository.GetById(dtoSubscription.Id);
            if (existingSubscription == null) return null;
            existingSubscription.PlanId = dtoSubscription.PlanId;
            var s = await _subscriptionRepository.Update(existingSubscription);
            return new DtoSubscription
            {
                Id = s.Id,
                PlanId = s.PlanId
            };
        }

        public async Task<bool> DeleteSubscription(int id)
        {
            return await _subscriptionRepository.Delete(id);
        }
    }
}
