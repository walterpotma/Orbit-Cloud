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
            

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] 1/3: Iniciando Clone de {request.AppName}...");
                var accessToken = await _githubService.GetInstallationTokenAsync(request.InstallationId);
                var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                var localPath = await _githubService.CloneRepositoryAsync(
                    request.CloneUrl,
                    accessToken,
                    request.AppName
                );

                if (githubId == null)
                {
                    Console.WriteLine($"[ORBIT-PIPELINE] ERRO: GitHub ID do usuário não encontrado.");
                    return BadRequest(new { error = "GitHub ID do usuário não encontrado." });
                }

                Console.WriteLine($"[ORBIT-PIPELINE] 2/3: Gerando Dockerfile...");
                await _dockerService.GenerateDockerfile(githubId.ToString(), request.RepoName, request.AppName);

                Console.WriteLine($"[ORBIT-PIPELINE] 3/3: Criando Imagem Docker v{request.Version}...");
                await _dockerService.GenerateImage(githubId.ToString(), request.AppName, request.Version);

                Console.WriteLine($"[ORBIT-PIPELINE] Sucesso Total!");
                return Ok(new
                {
                    message = "Pipeline de Build executado com sucesso!",
                    details = new
                    {
                        app = request.AppName,
                        version = request.Version,
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
    }
}