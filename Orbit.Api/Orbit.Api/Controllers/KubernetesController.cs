using k8s.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Application.DTOs.kubernetes;
using Orbit.Application.Services;
using Orbit.Application.Interfaces;
using System.Xml.Linq;
using k8s.Autorest;

namespace Orbit.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class KubernetesController : ControllerBase
    {
        private readonly IKubernetesService _kubernetesService;

        public KubernetesController(IKubernetesService kubernetesService)
        {
            _kubernetesService = kubernetesService;
        }

        #region Kubernetes Deployments
        [HttpGet("deployments")]
        public async Task<IActionResult> GetAllDeployments(string namespaces)
        {
            var result = await _kubernetesService.GetAllDeploymentsAsync(namespaces);
            return Ok(result);
        }

        [HttpGet("deployments/{namespaces}")]
        public async Task<IActionResult> GetDeploymentsNamespace(string namespaces)
        {
            var result = await _kubernetesService.GetAllDeploymentsAsync(namespaces);
            return Ok(result);
        }

        [HttpPost("deployments/{namespaces}")]
        public async Task<IActionResult> CreateDeployment([FromBody] DtoDeploymentRequest request, string namespaces)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var createdDeployment = await _kubernetesService.CreateDeploymentAsync(request, namespaces);

                return CreatedAtAction(
                    nameof(GetAllDeployments),
                    new { namespaces = namespaces },
                    createdDeployment
                );
            }
            catch (k8s.Autorest.HttpOperationException ex)
            {
                return BadRequest($"Erro no Kubernetes: {ex.Message} - {ex.Response.Content}");
            }
        }
        #endregion

        #region Kubernetes Pods
        [HttpGet("pods")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPods(string? namespaces = null)
        {
            var pods = await _kubernetesService.GetAllPodsAsync(namespaces);
            return Ok(pods);
        }
        [HttpGet("pods/{namespaces}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPodsNamespace(string namespaces)
        {
            var pods = await _kubernetesService.GetAllPodsAsync(namespaces);
            if (!pods.Any())
            {
                return NotFound($"No pods found in namespace '{namespaces}'.");
            }

            return Ok(pods);
        }


        [HttpGet("pods/{namespaces}/{name}")]
        [ActionName(nameof(GetPodsByName))]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DtoIngressResponse>> GetPodsByName(string name, string namespaces)
        {
            var response = await _kubernetesService.GetPodsAsync(name, namespaces);

            if (response == null)
            {
                return NotFound($"Pods '{name}' não encontrado.");
            }

            return Ok(response);
        }
        [HttpDelete("pods/{namespaces}/{name}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeletePods(string name, string namespaces)
        {
            var existing = await _kubernetesService.GetPodsAsync(name, namespaces);
            if (existing == null)
            {
                return NotFound();
            }

            await _kubernetesService.DeletePodsAsync(name, namespaces);

            return NoContent();
        }
        #endregion

        #region Kubernetes Service
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
        [HttpGet("service/{namespaces}/{name}")]
        [ActionName(nameof(GetServicesByName))]
        [ProducesResponseType(typeof(DtoNamespaceResponse), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<DtoServiceResponse>> GetServicesByName(string name, string namespaces)
        {
            var response = await _kubernetesService.GetServicesAsync(name, namespaces);

            if (response == null)
            {
                return NotFound($"Service '{name}' não encontrado.");
            }

            return Ok(response);
        }
        [HttpPost("service/{namespaces}")]
        [ProducesResponseType(typeof(DtoServiceResponse), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(409)]
        public async Task<IActionResult> CreateService([FromBody] DtoServiceRequest request, string namespaces)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var response = await _kubernetesService.CreateServicesAsync(request, namespaces);

            return CreatedAtAction(
                nameof(GetServicesByName),
                new { name = response.Name, namespaces = response.Namespace },
                response
            );
        }
        [HttpDelete("service/{namespaces}/{name}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteServices(string name, string namespaces)
        {
            var existing = await _kubernetesService.GetServicesAsync(name, namespaces);
            if (existing == null)
            {
                return NotFound();
            }

            await _kubernetesService.DeleteServicesAsync(name, namespaces);

            return NoContent();
        }
        #endregion

        #region Kubernetes Ingress
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
        [HttpGet("namespace/metrics")]
        public async Task<IActionResult> GetMetrics()
        {
            var result = await _kubernetesService.GetNamespaceMetricsAsync();
            return Ok(result);
        }
        [HttpGet("namespace/{namespaces}/metrics")]
        public async Task<IActionResult> GetByNamespaceMetrics(string namespaces)
        {
            var result = await _kubernetesService.GetByNamespaceMetricsAsync(namespaces);
            return Ok(result);
        }
        #endregion
    }
}
