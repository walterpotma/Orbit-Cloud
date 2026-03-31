using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Interfaces;
using Orbit.Domain.Entities.Github;
using Orbit.Application.DTOs.Github;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
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

            await _accountService.CreateWorkspaceAsync(long.Parse(GithubID), username ?? "", email ?? "");

            return Redirect("https://orbitcloud.com.br");
        }
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var githubId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(githubId)) return Unauthorized();

            var account = await _accountService.GetAccountByGithubIdAsync(long.Parse(githubId));

            var userProfile = new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                GithubID = githubId,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Username = User.FindFirst("urn:github:login")?.Value,
                AvatarUrl = User.FindFirst("urn:github:avatar")?.Value,

                AccountInfo = account
            };

            return Ok(userProfile);
        }
        #endregion

        #region Github APP
        [Authorize]
        [HttpGet("app/callback")]
        public static void CallbackApp()
        {

        }

        [Authorize]
        [HttpGet("repos/{installationId}")]
        public async Task<IActionResult> GetRepos(long installationId)
        {
            try
            {
                var repos = await _githubService.GetRepositoriesAsync(installationId);

                var result = repos.Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.FullName,
                    r.HtmlUrl,
                    r.Description
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao buscar repositórios: {ex.Message}");
            }
        }

        [HttpPost("clone")]
        public async Task<IActionResult> Clone([FromBody] DtoCloneRequest request)
        {
            try
            {
                // 1. Pega o Token necessário para acessar o repo privado do cliente
                // Você precisará desse método no seu GithubService
                var accessToken = await _githubService.GetInstallationTokenAsync(request.InstallationId);

                // 2. Executa a clonagem para: /data/archive/clients/{id}/tmp/{appName}
                var localPath = await _githubService.CloneRepositoryAsync(
                    request.CloneUrl,
                    accessToken,
                    request.AppName
                );

                // Retorna o caminho para o seu Front-end saber onde o código está
                return Ok(new
                {
                    message = "Repositório clonado com sucesso!",
                    path = localPath
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Erro na clonagem: {ex.Message}" });
            }
        }
        #endregion
    }
}