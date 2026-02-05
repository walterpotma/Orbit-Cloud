namespace Orbit.Application.DTOs.kubernetes
{
    public class DtoDeploymentResponse
    {
        public string Name { get; set; }
        public string Namespace { get; set; }
        public int ReplicasDesired { get; set; } // Quantos você pediu
        public int ReplicasReady { get; set; }   // Quantos estão rodando
        public string Status { get; set; }       // "Running", "Pending", "Failed"
        public string Age { get; set; }
        public string Image { get; set; }      // Ex: localhost:5000/orbit-api:v1.0.1
        public string ImageTag { get; set; }
    }
}
