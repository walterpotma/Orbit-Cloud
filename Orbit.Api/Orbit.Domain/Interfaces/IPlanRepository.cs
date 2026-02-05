using Orbit.Domain.Entities;
namespace Orbit.Domain.Interfaces
{
    public interface IPlanRepository
    {
        Task<List<Plan>> GetAll();
        Task<Plan> GetById(int id);
        Task<Plan> GetByName(string name);
        Task<Plan> Create(Plan plan);
        Task<Plan> Update(Plan plan);
        Task<bool> Delete(int id);
    }
}
