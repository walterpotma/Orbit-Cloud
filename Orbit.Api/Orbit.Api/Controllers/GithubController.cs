using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GithubController : ControllerBase
    {
        private readonly GithubService _githubService; // Adicione esta injeção

        // Atualize o construtor
        public GithubController(GithubService githubService)
        {
            _githubService = githubService;
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            var properties = new AuthenticationProperties { RedirectUri = "http://localhost:3000" };

            return Challenge(properties, "GitHub");
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            var claims = HttpContext.User.Claims;

            var userData = new
            {
                IsAuthenticated = HttpContext.User.Identity?.IsAuthenticated ?? false,

                Id = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value,
                Name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value,
                Email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value,
                Username = claims.FirstOrDefault(c => c.Type == "urn:github:login")?.Value,
                AllClaims = claims.ToDictionary(c => c.Type, c => c.Value)
            };

            return Ok(userData);
        }

        [HttpGet("repos")]
        [Authorize]
        public async Task<IActionResult> GetRepositories()
        {
            try
            {
                var repositories = await _githubService.GetCurrentUserRepositoriesAsync();
                return Ok(repositories);
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("webhook")]
        public async Task<IActionResult> Teste()
        {
            Console.WriteLine("deu certo o webhook");
            return Ok("Teste");
        }
    }
}