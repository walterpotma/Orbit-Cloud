using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces.Services;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly IPrometheusService _prometheusService;

        public MetricsController(IPrometheusService prometheusService)
        {
            _prometheusService = prometheusService;
        }

        [HttpGet("cpu/{namespaceName}")]
        public async Task<IActionResult> GetCpuMetrics(string namespaceName)
        {
            if (string.IsNullOrWhiteSpace(namespaceName))
                return BadRequest("O namespace é obrigatório.");

            var data = await _prometheusService.GetCpuUsageLast24h(namespaceName);

            return Ok(data);
        }

        [HttpGet("memory/{namespaceName}")]
        public async Task<IActionResult> GetMemoryMetrics(string namespaceName)
        {
            if (string.IsNullOrWhiteSpace(namespaceName))
                return BadRequest("O namespace é obrigatório.");

            var data = await _prometheusService.GetMemoryUsageLast24h(namespaceName);

            return Ok(data);
        }
    }
}