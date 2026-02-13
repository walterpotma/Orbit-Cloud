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
    // Removemos githubId e authToken daqui, pois vamos pegar internamente
    [FromQuery] string selectedRepository,
    [FromQuery] string appName,
    [FromQuery] string version,
    [FromQuery] string? appPath) // appPath pode ser opcional
        {
            // 1. Validar parâmetros de entrada básicos
            if (string.IsNullOrEmpty(selectedRepository) || string.IsNullOrEmpty(appName) || string.IsNullOrEmpty(version))
            {
                return BadRequest(new { error = "Campos obrigatórios: reposURL, appName, version." });
            }

            // 2. Recuperar o ID do Usuário (GithubID) das Claims
            // O ClaimTypes.NameIdentifier foi mapeado para o ID do GitHub no seu Program.cs
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId))
            {
                return Unauthorized(new { error = "Não foi possível identificar o usuário logado." });
            }

            // 3. Recuperar o Token de Acesso (AuthToken) do Cookie
            // Isso só funciona se "SaveTokens = true" estiver no Program.cs
            var authToken = await HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(authToken))
            {
                return Unauthorized(new { error = "Token de acesso do GitHub não encontrado. Faça login novamente." });
            }

            // Define appPath padrão se não vier
            if (string.IsNullOrEmpty(appPath)) appPath = appName;

            try
            {
                Console.WriteLine($"[ORBIT-PIPELINE] Usuário: {githubId} | App: {appName}");

                Console.WriteLine($"[ORBIT-PIPELINE] 1/3: Iniciando Clone...");
                // Agora passamos o token seguro recuperado do contexto
                var uri = new Uri(selectedRepository);
                var segments = uri.AbsolutePath.Trim('/').Split('/');
                var owner = segments[0];
                var repoName = segments[1].Replace(".git", "");

                // Chama o novo método que já sabe pegar o token sozinho
                await _githubService.CloneReposByNameAsync(owner, repoName);

                Console.WriteLine($"[ORBIT-PIPELINE] 2/3: Gerando Dockerfile com Nixpacks...");
                await _dockerService.GenerateDockerfile(githubId, repoName, appName);

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


        //[Authorize]
        //[HttpPost("clone-repos")]
        //[Authorize]
        //public async Task<IActionResult> CloneRepository([FromQuery] string githubId, [FromQuery] string reposURL, [FromQuery] string authToken, [FromQuery] string appName)
        //{
        //    try
        //    {
        //        await _githubService.CloneRepos(githubId, reposURL, authToken, appName);
        //        return Ok(new { message = "Repositório clonado com sucesso.", app = appName });
        //    }
        //    catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        //}

        //[HttpPost("create-dockerfile")]
        //public async Task<IActionResult> GenerateDockerfile([FromQuery] string githubId, [FromQuery] string appName)
        //{
        //    try
        //    {
        //        await _dockerService.GenerateDockerfile(githubId, appName);
        //        return Ok(new { message = "Dockerfile gerado.", app = appName });
        //    }
        //    catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        //}

        //[HttpPost("create-image")]
        //public async Task<IActionResult> GenerateImage([FromQuery] string githubId, [FromQuery] string appName, [FromQuery] string version, [FromQuery] string appPath)
        //{
        //    try
        //    {
        //        await _dockerService.GenerateImage(githubId, appName, version, appPath);
        //        return Ok(new { message = "Imagem gerada.", app = appName });
        //    }
        //    catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
        //}
    }
}