using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces
{
    public interface IRuleRepository
    {
        Task<List<Rule>> GetAll();
        Task<Rule> GetById(int id);
        Task<Rule> Create(Rule rule);
        Task<Rule> Update(Rule rule);
        Task<bool> Delete(int id);
    }
}
