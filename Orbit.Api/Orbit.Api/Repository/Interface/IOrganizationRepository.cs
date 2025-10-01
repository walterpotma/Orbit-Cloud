using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
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
