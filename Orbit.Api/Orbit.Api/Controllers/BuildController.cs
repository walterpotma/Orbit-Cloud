using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BuildController : Controller
    {
        private readonly GithubService _githubService;
        private readonly DockerService _dockerService;

        public BuildController(GithubService githubService, DockerService dockerService) {
            _githubService = githubService;
            _dockerService = dockerService;
        }

        [HttpPost("clone")]
        public async Task<IActionResult> CloneRepository([FromQuery] string githubId, [FromQuery] string reposURL, [FromQuery] string authToken, [FromQuery] string appName)
        {
            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(reposURL) || string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(appName))
            {
                return BadRequest(new { error = "githubId, reposURL, authToken e appName são obrigatórios." });
            }
            try
            {
                await _githubService.CloneRepos(githubId, reposURL, authToken, appName);
                return Ok(new { message = "Repositório clonado com sucesso.", app = appName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Erro ao clonar repositório: {ex.Message}" });
            }
        }

        // A rota final será: POST /api/docker/generate
        [HttpPost("dockerfile")]
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

        // A rota final será: POST /api/docker/generate
        [HttpPost("create-image")]
        public async Task<IActionResult> GenerateImage([FromQuery] string githubId, [FromQuery] string appName, [FromQuery] string version, [FromQuery] string appPath)
        {
            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(appName))
            {
                return BadRequest(new { error = "githubId e appName são obrigatórios." });
            }

            try
            {
                await _dockerService.GenerateImage(githubId, appName, version, appPath);

                // Retornar um JSON é melhor para o frontend tratar
                return Ok(new { message = "Image gerada com sucesso.", app = appName });
            }
            catch (Exception ex)
            {
                // Logar o erro aqui seria uma boa prática
                return StatusCode(500, new { error = $"Erro ao gerar Image: {ex.Message}" });
            }
        }
    }
}
