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
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ListImagesInRegistry()
        {
            var images = await _imageService.ListImagesAsync();
            return Ok(images);
        }
        [HttpGet("{imageName}")]
        [ProducesResponseType(typeof(DtoImage), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetImageInRegistry(string imageName)
        {
            var image = await _imageService.GetImageAsync(imageName);
            if (image == null)
            {
                return NotFound();
            }
            return Ok(image);
        }
        [HttpDelete("{repositoryName}/tags/{tag}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteTagInRegistry(string repositoryName, string tag)
        {
            var result = await _imageService.DeleteTagAsync(repositoryName, tag);
            if (result)
            {
                return Ok();
            }
            return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao deletar a tag");
        }
    }
}