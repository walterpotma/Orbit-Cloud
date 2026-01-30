using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
// Se não tiver interface, pode remover o using abaixo, ou manter se estiver usando
// using Orbit.Api.Service.Interface; 

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BuildController : Controller
    {
        private readonly GithubService _githubService;
        private readonly DockerService _dockerService;

        public BuildController(GithubService githubService, DockerService dockerService)
        {
            _githubService = githubService;
            _dockerService = dockerService;
        }

        // Mudei para "pipeline" para ficar claro que roda tudo
        [HttpPost("pipeline")]
        public async Task<IActionResult> RunFullBuild(
            [FromQuery] string githubId,
            [FromQuery] string reposURL,
            [FromQuery] string authToken,
            [FromQuery] string appName,
            [FromQuery] string version,
            [FromQuery] string appPath)
        {
            // 1. Validação Única (Fail Fast)
            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(reposURL) ||
                string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(appName) ||
                string.IsNullOrEmpty(version))
            {
                return BadRequest(new { error = "Todos os campos são obrigatórios: githubId, reposURL, authToken, appName, version." });
            }

            // Define valor padrão para appPath se vier vazio/nulo
            if (string.IsNullOrEmpty(appPath)) appPath = appName;

            try
            {
                // --- PASSO 1: CLONE ---
                Console.WriteLine($"[ORBIT-PIPELINE] 1/3: Iniciando Clone de {appName}...");
                await _githubService.CloneRepos(githubId, reposURL, authToken, appName);

                // --- PASSO 2: GERAR DOCKERFILE ---
                Console.WriteLine($"[ORBIT-PIPELINE] 2/3: Gerando Dockerfile...");
                await _dockerService.GenerateDockerfile(githubId, appName);

                // --- PASSO 3: BUILD & PUSH DA IMAGEM ---
                Console.WriteLine($"[ORBIT-PIPELINE] 3/3: Criando Imagem Docker v{version}...");
                await _dockerService.GenerateImage(githubId, appName, version, appPath);

                // --- SUCESSO FINAL ---
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
                // Se der erro em QUALQUER etapa, cai aqui e avisa onde parou
                Console.WriteLine($"[ORBIT-PIPELINE] FALHA CRÍTICA: {ex.Message}");
                return StatusCode(500, new
                {
                    error = "Falha no Pipeline de Build.",
                    details = ex.Message
                });
            }
        }

        // --- MANTIVE OS ENDPOINTS ISOLADOS PARA TESTES (OPCIONAL) ---

        [HttpPost("clone")]
        public async Task<IActionResult> CloneRepository([FromQuery] string githubId, [FromQuery] string reposURL, [FromQuery] string authToken, [FromQuery] string appName)
        {
            try
            {
                await _githubService.CloneRepos(githubId, reposURL, authToken, appName);
                return Ok(new { message = "Repositório clonado com sucesso.", app = appName });
            }
            catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        }

        [HttpPost("dockerfile")]
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