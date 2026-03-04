using Orbit.Application.DTOs.Github;

namespace Orbit.Application.Mappers
{
    public class MapperGithub
    {
        public DtoGithubReposResponse MapToDto(GithubRepositoryEntity entity)
        {
            return new DtoGithubReposResponse
            {
                Id = entity.Id,
                Name = entity.Name,
                Url = entity.Url,
                IsPrivate = entity.IsPrivate
            };
        }
    }
}