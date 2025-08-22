using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using System.Net.Http.Headers;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GithubController : ControllerBase
    {
        private readonly GithubService _githubService;

        public GithubController(GithubService githubService)
        {
            _githubService = githubService;
        }

        [HttpGet("repos")]
        [Authorize]
        public async Task<IActionResult> GetRepositories()
        {
            string accessToken = string.Empty;

            if (AuthenticationHeaderValue.TryParse(Request.Headers["Authorization"], out var headerValue))
            {
                accessToken = headerValue.Parameter;
            }

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("O token de acesso não foi encontrado ou está mal formatado.");
            }

            var repos = await _githubService.GetRepositoriesAsync(accessToken);
            return Ok(repos);
        }
    }
}
