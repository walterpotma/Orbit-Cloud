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
        private readonly Kubernetes _client;

        public DeployRepository()
        {
            var caCertPath = Path.Combine(AppContext.BaseDirectory, "keys", "ca.crt");
            var tokenPath = Path.Combine(AppContext.BaseDirectory, "keys", "token.txt");

            var caCert = new X509Certificate2(caCertPath);
            var certs = new X509Certificate2Collection(caCert);

            var token = File.ReadAllText(tokenPath);

            var config = new KubernetesClientConfiguration
            {
                Host = "https://34.45.18.183:6443",
                SslCaCerts = certs,
                AccessToken = token
            };

            _client = new Kubernetes(config);
        }
        public async Task CreateDeploy(string imageName)
        {
            var deployment = new V1Deployment
            {
                ApiVersion = "apps/v1",
                Kind = "Deployment",
                Metadata = new V1ObjectMeta { Name = "teste-redis" },
                Spec = new V1DeploymentSpec
                {
                    Replicas = 1,
                    Selector = new V1LabelSelector
                    {
                        MatchLabels = new Dictionary<string, string> { { "app", "teste-api" } }
                    },
                    Template = new V1PodTemplateSpec
                    {
                        Metadata = new V1ObjectMeta
                        {
                            Labels = new Dictionary<string, string> { { "app", "teste-api" } }
                        },
                        Spec = new V1PodSpec
                        {
                            Containers = new List<V1Container>
                            {
                                new V1Container
                                {
                                    Name = "app",
                                    Image = imageName,
                                    Ports = new List<V1ContainerPort> { new V1ContainerPort(80) }
                                }
                            }
                        }
                    }
                }
            };
            await _client.CreateNamespacedDeploymentAsync(deployment, "default");
        }
    }
}