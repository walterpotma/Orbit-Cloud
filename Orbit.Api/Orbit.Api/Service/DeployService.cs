using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class DeployService
    {
        private readonly IDeployRepository _deployService;

        public DeployService (IDeployRepository deployService)
        {
            _deployService = deployService;
        }

        public async Task DeployImage(string imageName)
        {
            await _deployService.CreateDeploy(imageName);
        }
    }
}
