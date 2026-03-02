using System.Threading.Tasks;
using Orbit.Application.DTOs.Prometheus; // <--- ADICIONE ESTA LINHA ✅

namespace Orbit.Application.Interfaces
{
    public interface IPrometheusService
    {
        Task<DeploymentMetricsResponse> GetCpuUsageLast24h(string namespaceName);
        Task<DeploymentMetricsResponse> GetMemoryUsageLast24h(string namespaceName);
    }
}