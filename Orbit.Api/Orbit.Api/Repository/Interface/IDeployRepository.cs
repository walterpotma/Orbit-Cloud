namespace Orbit.Api.Repository.Interface
{
    public interface IDeployRepository
    {
        Task CreateDeploy(string imageName);
    }
}
