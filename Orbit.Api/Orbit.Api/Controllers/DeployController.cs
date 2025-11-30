using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto.kubernetes;
using Orbit.Api.Dto_s;
using Orbit.Api.Service;

namespace Orbit.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DeployController : ControllerBase
    {
        private DeployService _deployService;

        public DeployController(DeployService deployService)
        {
            _deployService = deployService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(DtoDeployment), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrUpdateDeployment([FromBody] DtoDeployRequest deployRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _deployService.CreateOrUpdateDeploymentAsync(deployRequest);
                // Retorna 201 Created com os dados do deploy
                return CreatedAtAction(nameof(CreateOrUpdateDeployment), new { name = result.Name, ns = result.Namespace }, result);
            }
            catch (Exception ex)
            {
                // Captura erros da API do Kubernetes
                return StatusCode(500, $"Erro ao processar deploy: {ex.Message}");
            }
        }
    }
}