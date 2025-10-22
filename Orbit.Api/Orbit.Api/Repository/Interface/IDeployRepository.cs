using k8s.Models;

namespace Orbit.Api.Repository.Interface
{
    public interface IDeployRepository
    {
        Task<V1Deployment> GetDeploymentAsync(string name, string namespaceName);
        Task<V1Deployment> CreateDeploymentAsync(V1Deployment deployment);
        Task<V1Deployment> UpdateDeploymentAsync(V1Deployment deployment);
        Task DeleteDeploymentAsync(string name, string namespaceName);
    }
}
