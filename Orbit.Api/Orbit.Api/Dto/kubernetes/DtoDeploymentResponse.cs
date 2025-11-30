namespace Orbit.Api.Dto.kubernetes
{
    public class DtoDeploymentResponse
    {
        public string Name { get; set; }
        public string Namespace { get; set; }
        public int ReplicasDesired { get; set; } // Quantos você pediu
        public int ReplicasReady { get; set; }   // Quantos estão rodando
        public string Status { get; set; }       // "Running", "Pending", "Failed"
        public string Age { get; set; }
    }
}
