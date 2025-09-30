using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using System.Security.Claims;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<List<IActionResult>> GetAll()
        {
            return await _accountService.GetAll();
        }

        [HttpGet("GetInfos")]
        public async Task<IActionResult> GetOrCreate()
        {
            var githubId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(githubId) || string.IsNullOrEmpty(email))
                return BadRequest("Não foi possível recuperar dados do usuário.");

            var userDto = await _accountService.GetByGitIdOrCreate(githubId, name ?? "", email);

            return Ok(userDto);
        }
    }
}
