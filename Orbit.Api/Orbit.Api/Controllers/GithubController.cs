using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;
using Orbit.Infrastucture.Entities.Github;

namespace Orbit.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GithubService : IGithubService
    {
        private readonly IGithubService _githubService;

        public GithubService(IGithubService githubService)
        {
            _githubService = githubService;
        }

        #region Github oAtuh
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
        #endregion

        #region Github App
        [HttpGet("install-callback")]
        public async Task<IActionResult> InstallCallback([FromQuery] string installation_id)
        {
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId)) return Unauthorized();

            await _githubService.RegisterInstallationAsync(installation_id, githubId);

            return Redirect("https://orbitcloud.com.br/dashboard?install=success");
        }
        #endregion
    }
}