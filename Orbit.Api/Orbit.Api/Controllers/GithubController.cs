using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto.Github;
using Orbit.Api.Service;
using Orbit.Api.Service.Interface;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace Orbit.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GithubController : ControllerBase
    {
        private readonly IGithubService _githubService;

        public GithubController(IGithubService githubService)
        {
            _githubService = githubService;
        }

        #region Github Authentication
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

        [HttpGet("token")]
        [Authorize]
        public async Task<IActionResult> GetMyTokenForTesting()
        {
            var accessToken = await HttpContext.GetTokenAsync("access_token");

            if (string.IsNullOrEmpty(accessToken))
            {
                return NotFound("Token não encontrado. Faça o login primeiro.");
            }

            return Ok(new { AccessToken = accessToken });
        }
        #endregion

        #region Github Repositories
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
        [HttpGet("repos/{owner}/{repoName}")]
        [Authorize]
        public async Task<IActionResult> GetRepositoryByName(
            [FromRoute] string owner,
            [FromRoute] string repoName)
        {
            try
            {
                var repository = await _githubService.GetCurrentUserRepositoryAsync(owner, repoName);
                return Ok(repository);
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("repos/{owner}/{repoName}/clone")]
        [Authorize]
        public async Task<IActionResult> CloneRepository(
            [FromRoute] string owner,
            [FromRoute] string repoName)
        {
            try
            {
                await _githubService.CloneReposByNameAsync(owner, repoName);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
        #endregion

        #region Github Webhooks
        [HttpGet("repos/{owner}/{repoName}/webhooks")]
        public async Task<IActionResult> GetWebhooks([FromRoute] string owner, [FromRoute] string repoName)
        {
            try
            {
                var webhooks = await _githubService.GetCurrentUserRepoWebhooksAsync(owner, repoName);
                return Ok(webhooks);
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("repos/{owner}/{repoName}/webhooks/{hookId}")]
        public async Task<IActionResult> GetWebhookById(
            [FromRoute] string owner,
            [FromRoute] string repoName,
            [FromRoute] int hookId)
        {
            try
            {
                var webhook = await _githubService.GetCurrentUserRepoWebhookIdAsync(owner, repoName, hookId);
                return Ok(webhook);
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("repos/{owner}/{repoName}/webhooks")]
        [Authorize]
        public async Task<IActionResult> CreateWebhook(
        [FromRoute] string owner,
        [FromRoute] string repoName,
        [FromBody] DtoWebhookRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdWebhook = await _githubService.CreateCurrentUserRepoWebhookAsync(owner, repoName, request);

                return Ok(createdWebhook);
            }
            catch (HttpRequestException ex)
            {
                return BadRequest(new { message = $"Falha na API do GitHub: {ex.Message}" });
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpDelete("repos/{owner}/{repoName}/webhooks/{hookId}")]
        [Authorize]
        public async Task<IActionResult> DeleteWebhook(
            [FromRoute] string owner,
            [FromRoute] string repoName,
            [FromRoute] int hookId)
        {
            try
            {
                await _githubService.DeleteWebhookAsync(owner, repoName, hookId);
                return NoContent();
            }
            catch (HttpRequestException ex)
            {
                return BadRequest(new { message = $"Falha na API do GitHub: {ex.Message}" });
            }
            catch (System.Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
        #endregion
    }
}