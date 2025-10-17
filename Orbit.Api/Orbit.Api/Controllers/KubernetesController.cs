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
        public async Task<IActionResult> GetPods(string? namespaceName = null)
        {
            var pods = await _kubernetesService.GetAllPodsAsync(namespaceName);
            return Ok(pods);
        }
        [HttpGet("pods/{namespaceName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPodsNamespace(string namespaceName)
        {
            var pods = await _kubernetesService.GetAllPodsAsync(namespaceName);
            if (!pods.Any())
            {
                return NotFound($"No pods found in namespace '{namespaceName}'.");
            }

            return Ok(pods);
        }

        [HttpGet("services")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetServices(string? namespaceName = null)
        {
            var services = await _kubernetesService.GetAllServicesAsync(namespaceName);
            return Ok(services);
        }
        [HttpGet("services/{namespaceName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetServicesNamespace(string namespaceName)
        {
            var services = await _kubernetesService.GetAllServicesAsync(namespaceName);
            if (!services.Any())
            {
                return NotFound($"No services found in namespace '{namespaceName}'.");
            }
            return Ok(services);
        }


        [HttpGet("ingresses")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetIngresses(string? namespaceName = null)
        {
            var ingresses = await _kubernetesService.GetAllIngressesAsync(namespaceName);
            return Ok(ingresses);
        }
        [HttpGet("ingresses/{namespaceName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetIngressesNamespace(string namespaceName)
        {
            var ingresses = await _kubernetesService.GetAllIngressesAsync(namespaceName);
            if (!ingresses.Any())
            {
                return NotFound($"No ingresses found in namespace '{namespaceName}'.");
            }
            return Ok(ingresses);
        }

        [HttpGet("secrets")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSecrets(string? namespaceName = null)
        {
            var secrets = await _kubernetesService.GetAllSecretsAsync(namespaceName);
            return Ok(secrets);
        }

        [HttpGet("secrets/{namespaceName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSecretsNamespace(string namespaceName)
        {
            var secrets = await _kubernetesService.GetAllSecretsAsync(namespaceName);
            if (!secrets.Any())
            {
                return NotFound($"No secrets found in namespace '{namespaceName}'.");
            }
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
