using k8s;
using k8s.Models;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Orbit.Api.Repository.Interface;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace Orbit.Api.Repository
{
    public class DeployRepository : IDeployRepository
    {
        private readonly IKubernetes _k8sClient;

        // O IKubernetes é injetado aqui, pois você o registrou no Program.cs
        public DeployRepository(IKubernetes k8sClient)
        {
            _k8sClient = k8sClient;
        }

        public async Task<V1Deployment> GetDeploymentAsync(string name, string namespaceName)
        {
            try
            {
                // Lê um deployment específico
                return await _k8sClient.AppsV1.ReadNamespacedDeploymentAsync(name, namespaceName);
            }
            catch (k8s.Autorest.HttpOperationException ex) when (ex.Response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null; // Retorna nulo se não encontrar
            }
        }

        public async Task<V1Deployment> CreateDeploymentAsync(V1Deployment deployment)
        {
            // Cria um novo deployment
            return await _k8sClient.AppsV1.CreateNamespacedDeploymentAsync(deployment, deployment.Metadata.NamespaceProperty);
        }

        public async Task<V1Deployment> UpdateDeploymentAsync(V1Deployment deployment)
        {
            // Atualiza um deployment existente
            return await _k8sClient.AppsV1.ReplaceNamespacedDeploymentAsync(deployment, deployment.Metadata.Name, deployment.Metadata.NamespaceProperty);
        }

        public async Task DeleteDeploymentAsync(string name, string namespaceName)
        {
            // Deleta um deployment
            await _k8sClient.AppsV1.DeleteNamespacedDeploymentAsync(name, namespaceName);
        }
    }
}