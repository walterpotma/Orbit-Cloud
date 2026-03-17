using LibGit2Sharp;
using Orbit.Infrastructure.Entities.Github;
using Orbit.Domain.Interfaces;
using Orbit.Application.Mappers;
using Orbit.Application.Interfaces;
using System.Net.Http.Headers;

namespace Orbit.Infrastructure.Repository
{
    public class GithubRepository : IGithubRepository
    {
        private readonly MapperGithub _mapper;

        public GithubRepository(MapperGithub mapper)
        {
            _mapper = mapper;
        }

        public async Task<string> GetInstallationTokenAsync(string installationId)
        {
            var jwt = _authService.GenerateJwt();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

            var response = await _httpClient.PostAsync(
                $"https://api.github.com/app/installations/{installationId}/access_tokens", null);

            var content = await response.Content.ReadFromJsonAsync<GithubTokenResponse>();
            return content.Token;
        }
    }
}