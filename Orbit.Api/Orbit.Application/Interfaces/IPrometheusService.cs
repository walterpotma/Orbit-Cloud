using Orbit.Application.DTOs; // Importe o DTO
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Application.Interfaces.Services
{
    public interface IPrometheusService
    {
        Task<DeploymentMetricsResponse> GetCpuUsageLast24h(string namespaceName);
        Task<DeploymentMetricsResponse> GetMemoryUsageLast24h(string namespaceName);
    }
}