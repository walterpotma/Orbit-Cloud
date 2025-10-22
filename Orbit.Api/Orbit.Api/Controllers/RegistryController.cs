using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto.Registry;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistryController : ControllerBase
    {
        private readonly IRegistryService _imageService;

        public RegistryController(IRegistryService imageService)
        {
            _imageService = imageService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DtoImage>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListImagesInRegistry()
        {
            try
            {
                var images = await _imageService.ListImagesAsync();
                return Ok(images);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao listar imagens: {ex.Message}");
            }
        }

        [HttpPost("build")]
        [ProducesResponseType(typeof(DtoImageBuild), StatusCodes.Status201Created)]
        public async Task<IActionResult> BuildImage([FromBody] DtoImage request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var result = await _imageService.BuildAndPushImageAsync(request);
                return CreatedAtAction(nameof(BuildImage), result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao construir imagem: {ex.Message}");
            }
        }
    }
}