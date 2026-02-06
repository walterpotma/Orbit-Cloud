using Orbit.Application.DTOs; // Importe o DTO
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Application.Interfaces.Services
{
    public interface IPrometheusService
    {
        // Agora o contrato é explícito e bate com a implementação
        Task<List<MetricPoint>> GetCpuUsageLast24h(string namespaceName);
        Task<List<MetricPoint>> GetMemoryUsageLast24h(string namespaceName);
    }
}