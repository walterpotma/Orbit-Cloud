using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Orbit.Application.DTOs.account.cs;
using Orbit.Domain.Entities.Github;
using Orbit.Application.Services;
using Orbit.Application.Interfaces;
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
        private readonly IAccountService _accountService;

        public GithubController(IGithubService githubService, IAccountService accountService)
        {
            _githubService = githubService;
            _accountService = accountService;
        }

        #region Github Authentication
        [HttpGet("login")]
        public IActionResult Login()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("Callback", "Github")
            };

            return Challenge(properties, "GitHub");
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            var result = await HttpContext.AuthenticateAsync("Cookies");

            if (!result.Succeeded)
            {
                return Redirect("https://orbitcloud.com.br?error=auth_failed");
            }

            var claims = HttpContext.User.Claims;
            var GithubID = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var username = claims.FirstOrDefault(c => c.Type == "urn:github:login")?.Value;
            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(username)) return BadRequest("Erro: Username não encontrado.");

            try
            {
                Console.WriteLine($"[Login] Usuário {username} processado com sucesso.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Login Error] {ex.Message}");
            }

            await _accountService.CreateWorkspaceAsync(GithubID ?? "");

            return Redirect("https://orbitcloud.com.br");
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var user = new
            {
                GithubID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Username = User.FindFirst("urn:github:login")?.Value,
                Name = User.FindFirst(ClaimTypes.Name)?.Value,
                Avatar = User.FindFirst("urn:github:avatar")?.Value,
                IsAuthenticated = true,
                AuthenticationToken = await HttpContext.GetTokenAsync("access_token")
            };
            return Ok(user);
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