using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using System;
using System.Threading.Tasks;

namespace Orbit.Api.Controllers
{
    // 1. Define que é uma API e o caminho base "api/docker"
    [ApiController]
    [Route("[controller]")]
    public class DockerController : ControllerBase // 2. Herança correta para APIs
    {
        private readonly DockerService _dockerService;

        public DockerController(DockerService dockerService)
        {
            _dockerService = dockerService;
        }

        // A rota final será: POST /api/docker/generate
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateDockerfile([FromQuery] string githubId, [FromQuery] string appName)
        {
            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(appName))
            {
                return BadRequest(new { error = "githubId e appName são obrigatórios." });
            }

            try
            {
                await _dockerService.GenerateDockerfile(githubId, appName);

                // Retornar um JSON é melhor para o frontend tratar
                return Ok(new { message = "Dockerfile gerado com sucesso.", app = appName });
            }
            catch (Exception ex)
            {
                // Logar o erro aqui seria uma boa prática
                return StatusCode(500, new { error = $"Erro ao gerar Dockerfile: {ex.Message}" });
            }
        }
    }
}