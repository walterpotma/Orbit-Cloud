using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface ITransacionRepository
    {
        Task<List<Transacion>> GetAll();
        Task<Transacion?> GetById(int id);
        Task<Transacion> Create(Transacion transacion);
        Task<Transacion?> Update(int id, Transacion transacion);
        Task<bool> Delete(int id);
    }
}
