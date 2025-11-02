using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto.kubernetes;
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

        #region
        [HttpGet("ingress")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetIngresses(string? namespaces = null)
        {
            var ingresses = await _kubernetesService.GetAllIngressAsync(namespaces);
            return Ok(ingresses);
        }
        [HttpGet("ingress/{namespaces}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetIngressesNamespace(string namespaces)
        {
            var response = await _kubernetesService.GetAllIngressAsync(namespaces);
            if (!response.Any())
            {
                return NotFound($"No ingresses found in namespace '{namespaces}'.");
            }
            return Ok(response);
        }

        [HttpGet("ingress/{namespaces}/{name}")]
        [ActionName(nameof(GetIngressByName))]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DtoIngressResponse>> GetIngressByName(string name, string namespaces)
        {
            var response = await _kubernetesService.GetIngressAsync(name, namespaces);

            if (response == null)
            {
                return NotFound($"Ingress '{name}' não encontrado.");
            }

            return Ok(response);
        }
        [HttpPost("ingress/{namespaces}")]
        [ProducesResponseType(typeof(DtoIngressResponse), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreateSecret([FromBody] DtoIngressRequest request, string namespaces)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var response = await _kubernetesService.CreateIngressAsync(request, namespaces);

            return CreatedAtAction(
                nameof(GetIngressByName),
                new { name = response.Name, namespaces = response.Namespace },
                response
            );
        }
        [HttpDelete("ingress/{namespaces}/{name}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteIngress(string name, string namespaces)
        {
            var existing = await _kubernetesService.GetIngressAsync(name, namespaces);
            if (existing == null)
            {
                return NotFound();
            }

            await _kubernetesService.DeleteIngressAsync(name, namespaces);

            return NoContent();
        }
        #endregion

        #region Kubernetes Secret
        [HttpGet("secrets")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSecrets(string? namespaceName = null)
        {
            var secrets = await _kubernetesService.GetAllSecretsAsync(namespaceName);
            return Ok(secrets);
        }

        [HttpGet("secrets/{namespaces}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetSecretsNamespace(string namespaces)
        {
            var secrets = await _kubernetesService.GetAllSecretsAsync(namespaces);
            if (!secrets.Any())
            {
                return NotFound($"No secrets found in namespace '{namespaces}'.");
            }
            return Ok(secrets);
        }

        [HttpGet("secrets/{namespaces}/{name}")]
        [ActionName(nameof(GetSecretByName))]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DtoSecretResponse>> GetSecretByName(string name, string namespaces)
        {
            var response = await _kubernetesService.GetSecretsAsync(name, namespaces);

            if (response == null)
            {
                return NotFound($"Secret '{name}' não encontrado.");
            }

            return Ok(response);
        }

        [HttpPost("secrets/{namespaces}")]
        [ProducesResponseType(typeof(DtoSecretResponse), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreateSecret([FromBody] DtoSecretRequest request, string namespaces)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var response = await _kubernetesService.CreateSecretsAsync(request, namespaces);

            return CreatedAtAction(
                nameof(GetSecretByName),
                new { name = response.Name, namespaces = response.Namespace },
                response
            );
        }
        [HttpDelete("secrets/{namespaces}/{name}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteSecret(string name, string namespaces)
        {
            var existing = await _kubernetesService.GetSecretsAsync(name, namespaces);
            if (existing == null)
            {
                return NotFound();
            }

            await _kubernetesService.DeleteSecretsAsync(name, namespaces);

            return NoContent();
        }
        #endregion

        #region Kubernetes Namespace
        [HttpGet("namespaces")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNamespaces()
        {
            var response = await _kubernetesService.GetAllNamespacesAsync();
            return Ok(response);
        }

        [HttpPost("namespaces")]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreateNamespace([FromBody] DtoNamespaceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var created = await _kubernetesService.CreateNamespacesAsync(request);

            return CreatedAtAction(
                nameof(GetNamespaceByName),
                new { name = created.Name },
                created
            );
        }

        [HttpGet("namespaces/{name}")]
        [ActionName(nameof(GetNamespaceByName))]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DtoNamespaceResponse>> GetNamespaceByName(string name)
        {
            var namespaceDto = await _kubernetesService.GetNamespacesAsync(name);

            if (namespaceDto == null)
            {
                return NotFound($"Namespace '{name}' não encontrado.");
            }

            return Ok(namespaceDto);
        }

        [HttpDelete("namespaces/{name}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteNamespace(string name)
        {
            var existing = await _kubernetesService.GetNamespacesAsync(name);
            if (existing == null)
            {
                return NotFound();
            }

            await _kubernetesService.DeleteNamespacesAsync(name);

            return NoContent();
        }
        #endregion
    }
}
