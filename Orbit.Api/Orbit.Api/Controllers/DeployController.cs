using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto_s;
using Orbit.Api.Service;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeployController : ControllerBase
    {
        private DeployService _deployService;

        public DeployController(DeployService deployService)
        {
            _deployService = deployService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateDeployRequest request)
        {
            if (string.IsNullOrEmpty(request.ImageName))
            {
                return BadRequest("O campo ImageName é obrigatório.");
            }

            await _deployService.DeployImage(request.ImageName);
            return Ok("Deployment criado com sucesso!");
        }
    }
}
