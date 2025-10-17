using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Service;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KubernetesController : ControllerBase
    {
        private readonly IKubernetesService _kubernetesService;

        public KubernetesController(IKubernetesService kubernetesService)
        {
            _kubernetesService = kubernetesService;
        }

        [HttpGet("pods")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPods()
        {
            var pods = await _kubernetesService.GetAllPodsAsync();
            return Ok(pods);
        }

        [HttpGet("services")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetServices()
        {
            var services = await _kubernetesService.GetAllServicesAsync();
            return Ok(services);
        }

        [HttpGet("ingresses")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetIngresses()
        {
            var ingresses = await _kubernetesService.GetAllIngressesAsync();
            return Ok(ingresses);
        }

        [HttpGet("secrets")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSecrets()
        {
            var secrets = await _kubernetesService.GetAllSecretsAsync();
            return Ok(secrets);
        }

        [HttpGet("namespaces")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNamespaces()
        {
            var namespaces = await _kubernetesService.GetAllNamespacesAsync();
            return Ok(namespaces);
        }
    }
}
