using Orbit.Application.DTOs; // Importe o DTO
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Application.Interfaces.Services
{
    public interface IPrometheusService
    {        Task<List<MetricPoint>> GetCpuUsageLast24h(string namespaceName);
        Task<List<MetricPoint>> GetMemoryUsageLast24h(string namespaceName);
    }
}