using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BuildController : Controller
    {
        private readonly IGithubService _githubService;
        private readonly IDockerService _dockerService;

        public BuildController(IGithubService githubService, IDockerService dockerService)
        {
            _githubService = githubService;
            _dockerService = dockerService;
        }

        [HttpPost("artifact")]
        public async Task<IActionResult> RunFullBuild(
            [FromQuery] string githubId,
            [FromQuery] string reposURL,
            [FromQuery] string authToken,
            [FromQuery] string appName,
            [FromQuery] string version,
            [FromQuery] string appPath)
        {
            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(reposURL) ||
                string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(appName) ||
                string.IsNullOrEmpty(version))
            {
                return BadRequest(new { error = "Todos os campos são obrigatórios: githubId, reposURL, authToken, appName, version." });
            }

            if (string.IsNullOrEmpty(appPath)) appPath = appName;

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] 1/3: Iniciando Clone de {appName}...");
                await _githubService.CloneRepos(githubId, reposURL, authToken, appName);

                Console.WriteLine($"[ORBIT-PIPELINE] 2/3: Gerando Dockerfile...");
                await _dockerService.GenerateDockerfile(githubId, appName);

                Console.WriteLine($"[ORBIT-PIPELINE] 3/3: Criando Imagem Docker v{version}...");
                await _dockerService.GenerateImage(githubId, appName, version, appPath);

                Console.WriteLine($"[ORBIT-PIPELINE] Sucesso Total!");
                return Ok(new
                {
                    message = "Pipeline de Build executado com sucesso!",
                    details = new
                    {
                        app = appName,
                        version = version,
                        status = "Deployed to Registry"
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ORBIT-PIPELINE] FALHA CRÍTICA: {ex.Message}");
                return StatusCode(500, new
                {
                    error = "Falha no Pipeline de Build.",
                    details = ex.Message
                });
            }
        }


        [HttpPost("clone-repos")]
        [Authorize]
        public async Task<IActionResult> CloneRepository([FromQuery] string githubId, [FromQuery] string reposURL, [FromQuery] string authToken, [FromQuery] string appName)
        {
            try
            {
                await _githubService.CloneRepos(githubId, reposURL, authToken, appName);
                return Ok(new { message = "Repositório clonado com sucesso.", app = appName });
            }
            catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        }

        [HttpPost("create-dockerfile")]
        public async Task<IActionResult> GenerateDockerfile([FromQuery] string githubId, [FromQuery] string appName)
        {
            try
            {
                await _dockerService.GenerateDockerfile(githubId, appName);
                return Ok(new { message = "Dockerfile gerado.", app = appName });
            }
            catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        }

        [HttpPost("create-image")]
        public async Task<IActionResult> GenerateImage([FromQuery] string githubId, [FromQuery] string appName, [FromQuery] string version, [FromQuery] string appPath)
        {
            try
            {
                await _dockerService.GenerateImage(githubId, appName, version, appPath);
                return Ok(new { message = "Imagem gerada.", app = appName });
            }
            catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        }
    }
}