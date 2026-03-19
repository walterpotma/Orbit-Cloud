using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;
using Orbit.Domain.Entities.Github;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Orbit.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
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

            await _accountService.CreateWorkspaceAsync(long.Parse(GithubID) ?? "", username ?? "", email ?? "");

            return Redirect("https://orbitcloud.com.br");
        }
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMe()
        {

            var user = new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                githubID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Username = User.FindFirst("urn:github:login")?.Value,
                AvatarUrl = User.FindFirst("urn:github:avatar")?.Value
            };

            return Ok(user);
        }
        #endregion

        #region Github App
        [HttpGet("install-callback")]
        public async Task<IActionResult> InstallCallback([FromQuery] string installation_id)
        {
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId)) return Unauthorized();

            await _githubService.RegisterInstallationAsync(installation_id, githubId);

            return Redirect("https://orbitcloud.com.br/artifact");
        }
        #endregion
    }
}