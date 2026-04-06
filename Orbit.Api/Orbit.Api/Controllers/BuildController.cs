using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;
using Orbit.Application.DTOs.Build;
using System.Security.Claims;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<IActionResult> RunFullBuild([FromBody] DtoBuildRequest request)
        {
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (githubId == null) return BadRequest(new { error = "Usuário não identificado." });

            string accessToken = "";
            string localPath = "";

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] 1/3: Iniciando Clone de {request.AppName}...");
                accessToken = await _githubService.GetInstallationTokenAsync(request.InstallationId);
                localPath = await _githubService.CloneRepositoryAsync(request.CloneUrl, accessToken, request.AppName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO ETAPA 1 - GITHUB]: {ex.Message}");
                return StatusCode(500, new { step = "Clone/Auth", error = ex.Message });
            }

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] 2/3: Gerando Dockerfile...");
                await _dockerService.GenerateDockerfile(githubId, request.RepoName, request.AppName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO ETAPA 2 - NIXPACKS]: {ex.Message}");
                return StatusCode(500, new { step = "Nixpacks/Generation", error = ex.Message });
            }

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] 3/3: Criando Imagem Docker v{request.Version}...");
                await _dockerService.GenerateImage(githubId, request.AppName, request.Version);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERRO ETAPA 3 - DOCKER BUILD]: {ex.Message}");
                return StatusCode(500, new { step = "Docker Build/Push", error = ex.Message });
            }

            Console.WriteLine($"[ORBIT-PIPELINE] Sucesso Total para {request.AppName}!");
            return Ok(new { message = "Pipeline Finalizado com Sucesso!" });
        }
    }
}