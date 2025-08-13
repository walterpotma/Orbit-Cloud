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
                AccessToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IlEweU5vekhKNTFmNXpESTYyVFRCQlJDdEVFck03UTJtZzR4Z0llcXBEM0kifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImFwaS1kZXBsb3llci10b2tlbiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJhcGktZGVwbG95ZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIzYzNiYzgyNS1hNGIwLTQ0ZmYtODQ2OC1lMjRhYjZmYmJlNGMiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6ZGVmYXVsdDphcGktZGVwbG95ZXIifQ.nW3wYIJFnJ2Rp6hRHQTevFMfa9c3J9UCe3ICxueiy-PAuz5Xhwc--S-R1YkjNGJ9uWvyBM3u3Jd5ibqlP6TegZczch2Z0Hu1FlkIsBd24C70D-KHVkU9kJNPMJdOrmBy6QXwnR8nPNptaGTyk68ksLFu_UczwRNAcLstS4hfnmHv4j7Whrkk7f0MlZVsk-_WY-pcfu75gZzLWgRu-jBdd4l0XFeGqQFdyD989PV6b-RJYuTjbrxeHNEcdOaz5YvMdKbUbC7sKlLK0atH0_YwhXcpcJSbkk-kPV8RvbVtiqUXk7DImtv-S0tsbvIv9wqkA2TvbAGBDa9FIZZjgmXlvQ"
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