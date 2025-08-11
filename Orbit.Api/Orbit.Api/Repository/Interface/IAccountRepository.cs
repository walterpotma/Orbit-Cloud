namespace Orbit.Api.Repository.Interface
{
    public interface IAccountRepository
    {
        Task<List<Model.Account>> GetAllAsync();
    }
}
