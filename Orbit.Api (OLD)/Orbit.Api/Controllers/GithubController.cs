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


        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMe()
        {

            var user = new
            {
                IsAuthenticated = User.Identity?.IsAuthenticated,
                githubID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value, // Seu ID do GitHub
                Name = User.FindFirst(ClaimTypes.Name)?.Value,         // Nome
                Email = User.FindFirst(ClaimTypes.Email)?.Value,       // Email
                Username = User.FindFirst("urn:github:login")?.Value,  // Login do GitHub
                AvatarUrl = User.FindFirst("urn:github:avatar")?.Value // Foto
            };

            return Ok(user);
        }
        #endregion

        #region Github Repositories
        [Authorize]
        [HttpGet("repos")]
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



        [Authorize]
        [HttpGet("repos/{owner}/{repoName}")]
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

        [Authorize]
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

        //#region Github Webhooks
        //[Authorize]
        //[HttpGet("repos/{owner}/{repoName}/webhooks")]
        //public async Task<IActionResult> GetWebhooks([FromRoute] string owner, [FromRoute] string repoName)
        //{
        //    try
        //    {
        //        var webhooks = await _githubService.GetCurrentUserRepoWebhooksAsync(owner, repoName);
        //        return Ok(webhooks);
        //    }
        //    catch (System.Exception ex)
        //    {
        //        return Unauthorized(new { message = ex.Message });
        //    }
        //}

        //[Authorize]
        //[HttpGet("repos/{owner}/{repoName}/webhooks/{hookId}")]
        //public async Task<IActionResult> GetWebhookById(
        //    [FromRoute] string owner,
        //    [FromRoute] string repoName,
        //    [FromRoute] int hookId)
        //{
        //    try
        //    {
        //        var webhook = await _githubService.GetCurrentUserRepoWebhookIdAsync(owner, repoName, hookId);
        //        return Ok(webhook);
        //    }
        //    catch (System.Exception ex)
        //    {
        //        return Unauthorized(new { message = ex.Message });
        //    }
        //}

        //[Authorize]
        //[HttpPost("repos/{owner}/{repoName}/webhooks")]
        //[Authorize]
        //public async Task<IActionResult> CreateWebhook(
        //[FromRoute] string owner,
        //[FromRoute] string repoName,
        //[FromBody] DtoWebhookRequest request)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    try
        //    {
        //        var createdWebhook = await _githubService.CreateCurrentUserRepoWebhookAsync(owner, repoName, request);

        //        return Ok(createdWebhook);
        //    }
        //    catch (HttpRequestException ex)
        //    {
        //        return BadRequest(new { message = $"Falha na API do GitHub: {ex.Message}" });
        //    }
        //    catch (System.Exception ex)
        //    {
        //        return Unauthorized(new { message = ex.Message });
        //    }
        //}

        //[Authorize]
        //[HttpDelete("repos/{owner}/{repoName}/webhooks/{hookId}")]
        //public async Task<IActionResult> DeleteWebhook(
        //    [FromRoute] string owner,
        //    [FromRoute] string repoName,
        //    [FromRoute] int hookId)
        //{
        //    try
        //    {
        //        await _githubService.DeleteWebhookAsync(owner, repoName, hookId);
        //        return NoContent();
        //    }
        //    catch (HttpRequestException ex)
        //    {
        //        return BadRequest(new { message = $"Falha na API do GitHub: {ex.Message}" });
        //    }
        //    catch (System.Exception ex)
        //    {
        //        return Unauthorized(new { message = ex.Message });
        //    }
        //}
        //#endregion

        [HttpPost("clone-by-name")]
        public async Task<IActionResult> CloneRepositoryByName([FromBody] CloneByNameRequest request)
        {
            if (string.IsNullOrEmpty(request.Owner) || string.IsNullOrEmpty(request.RepoName))
            {
                return BadRequest(new { error = "Owner e RepoName são obrigatórios." });
            }

            try
            {
                // Chama o método específico que você pediu
                // O Service já cuida de pegar o Token do contexto automaticamente
                await _githubService.CloneReposByNameAsync(request.Owner, request.RepoName);

                return Ok(new
                {
                    message = $"Repositório {request.Owner}/{request.RepoName} clonado com sucesso!",
                    status = "Cloned"
                });
            }
            catch (Exception ex)
            {
                // Retorna 500 se der erro no Git (ex: repo não existe, erro de permissão)
                return StatusCode(500, new { error = "Erro ao clonar repositório.", details = ex.Message });
            }
        }
    }

    // DTO para receber os dados do JSON
    public class CloneByNameRequest
    {
        public string Owner { get; set; }    // Ex: "walterpotma"
        public string RepoName { get; set; } // Ex: "Next-World-Front"
    }
}