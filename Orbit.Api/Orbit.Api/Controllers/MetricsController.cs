using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MetricsController : ControllerBase
    {
        private readonly PrometheusService _prometheusService;

        // Injeção de Dependência do Service que criamos antes
        public MetricsController(PrometheusService prometheusService)
        {
            _prometheusService = prometheusService;
        }

        // GET: api/metrics/cpu/orbitcloud
        [HttpGet("cpu/{namespaceName}")]
        public async Task<IActionResult> GetCpuMetrics(string namespaceName)
        {
            if (string.IsNullOrWhiteSpace(namespaceName))
                return BadRequest("O namespace é obrigatório.");

            var data = await _prometheusService.GetCpuUsageLast24h(namespaceName);

            return Ok(data);
        }

        // GET: api/metrics/memory/orbitcloud
        [HttpGet("memory/{namespaceName}")]
        public async Task<IActionResult> GetMemoryMetrics(string namespaceName)
        {
            if (string.IsNullOrWhiteSpace(namespaceName))
                return BadRequest("O namespace é obrigatório.");

            // Nota: Você precisará duplicar o método no Service trocando a query para memória
            var data = await _prometheusService.GetMemoryUsageLast24h(namespaceName);

            return Ok(data);
        }
    }
}
