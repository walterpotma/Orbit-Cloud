using LibGit2Sharp;
using Orbit.Infrastucture.Entities.Github;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Repository
{
    public class GithubRepository : IGithubRepository
    {
        public async Task<IEnumerable<DtoGithubReposResponse>> GetUserRepositoriesAsync()
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Usuário não identificado.");

            string accessToken = await _githubAuthService.GetTokenForUserAsync(userId);

            var httpClient = _httpClientFactory.CreateClient();
            
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.github.com/user/repos?type=owner");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("Orbit-App", "1.0"));

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            if (!response.IsSuccessStatusCode)
                return Enumerable.Empty<DtoReposResponse>();

            var content = await response.Content.ReadAsStringAsync();

            // return _mapper.MapToDto(content);

            return await JsonSerializer.DeserializeAsync<IEnumerable<DtoReposResponse>>(stream);
        }
        // public Task<DtoGithubReposResponse> GetRepositoryByNameAsync(string repoName)
        // {

        // }
        // public async Task<string> CloneRepositoryAsync(string repoName)
        // {

        // }
    }
}