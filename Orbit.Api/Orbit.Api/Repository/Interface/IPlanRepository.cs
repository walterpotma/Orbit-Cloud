using Orbit.Api.Model;
namespace Orbit.Api.Repository.Interface
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
