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
    }
}