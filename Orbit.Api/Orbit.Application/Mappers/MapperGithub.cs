using Orbit.Application.DTOs.Github;

namespace Orbit.Application.Mappers
{
    public class MapperGithub
    {
        public DtoGithubReposResponse MapToDto(DtoGithubReposResponse entity)
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