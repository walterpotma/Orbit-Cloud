using Orbit.Domain.Entities.Github; // Certifique-se que o DTO está acessível aqui
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Orbit.Domain.Interfaces
{
    public interface IGithubRepository
    {
        #region Github Repositories
        Task<IEnumerable<DtoGithubReposResponse>> GetRepositoriesAsync(string installationId);
        #endregion
    }
}