using System.Threading.Tasks;

namespace Orbit.Application.Interfaces
{
    public interface IDockerService
    {
        Task GenerateDockerfile(string githubId, string repoName, string appName);
        Task GenerateImage(string githubId, string appName, string version, string appPath);
    }
}