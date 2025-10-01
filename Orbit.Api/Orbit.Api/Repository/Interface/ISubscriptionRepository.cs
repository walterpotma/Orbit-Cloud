using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface ISubscriptionRepository
    {
        Task<List<Subscription>> GetAll();
        Task<Subscription> GetById(int id);
        Task<Subscription> Create(Subscription subscription);
        Task<Subscription> Update(Subscription subscription);
        Task<bool> Delete(int id);
    }
}
