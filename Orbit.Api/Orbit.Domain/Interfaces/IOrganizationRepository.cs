using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces
{
    public interface IOrganizationRepository
    {
        Task<List<Organization>> GetAll();
        Task<Organization> GetById(int id);
        Task<Organization> Create(Organization organization);
        Task<Organization> Update(Organization organization);
        Task<bool> Delete(int id);
    }
}
