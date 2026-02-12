using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;
using System.Security.Claims;

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

        [Authorize]
        [HttpPost("artifact")]
        public async Task<IActionResult> RunFullBuild(
    [FromQuery] string reposURL,
    [FromQuery] string appName,
    [FromQuery] string version,
    [FromQuery] string? appPath)
        {
            // ... (Validações de githubId e Token iguais ao anterior) ...
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var authToken = await HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(appPath)) appPath = appName;

            // --- A MUDANÇA MÁGICA COMEÇA AQUI ---

            // Em vez de esperar (await) o processo todo, nós o jogamos para uma Task separada
            _ = Task.Run(async () =>
            {
                try
                {
                    Console.WriteLine($"[BACKGROUND] Iniciando Pipeline para {appName}...");

                    // 1. Clone (Já refatoramos para C#, ok!)
                    await _githubService.CloneRepos(githubId, reposURL, authToken, appName);

                    // 2. Dockerfile (Vamos refatorar para C# agora)
                    await _dockerService.GenerateDockerfile(githubId, appName);

                    // 3. Build Imagem (Vamos refatorar para C# agora)
                    await _dockerService.GenerateImage(githubId, appName, version, appPath);

                    Console.WriteLine($"[BACKGROUND] Sucesso! {appName} v{version} deployado.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[BACKGROUND-ERROR] Falha no pipeline de {appName}: {ex.Message}");
                    // TODO: Aqui no futuro você salvaria o erro no banco para o usuário ver na tela de logs
                }
            });

            // Retornamos IMEDIATAMENTE para o front não dar Timeout 524
            return Accepted(new
            {
                message = "Pipeline iniciado em segundo plano!",
                details = new { app = appName, status = "Processing" }
            });
        }


        [Authorize]
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