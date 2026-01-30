using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BuildController : Controller
    {
       private readonly GithubService _githubService;

        public BuildController(GithubService githubService) {
            _githubService = githubService;
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
    }
}
