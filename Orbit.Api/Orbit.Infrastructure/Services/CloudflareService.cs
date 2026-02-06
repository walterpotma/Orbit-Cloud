using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

namespace Orbit.Infrastructure.Services;

public class CloudflareService
{
    private readonly HttpClient _httpClient;
    private readonly string _accountId;
    private readonly string _tunnelId;
    private readonly string _apiToken;

    public CloudflareService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient();
        _accountId = "5574573b7748e7868bb3bcb236f36f81";
        _tunnelId = "0e00cfd1-c368-4587-acd6-5a0a9f989e7b";
        _apiToken = "7DmK3dqhLKCwTs8m-UoxPMCuMlP1h9N1GoIQkE8b";

        // Configura o Header de Autorização padrão
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiToken);
    }

    public async Task<bool> CreateTunnelHostname(string subdomain, string serviceUrl)
    {
        // O Endpoint para gerenciar configurações do túnel
        var url = $"https://api.cloudflare.com/client/v4/accounts/{_accountId}/tunnels/{_tunnelId}/configurations";

        var dnsUrl = $"https://api.cloudflare.com/client/v4/zones/{GetZoneId()}/dns_records";

        var payload = new
        {
            type = "CNAME",
            name = subdomain,
            content = $"{_tunnelId}.cfargotunnel.com",
            ttl = 1,
            proxied = true
        };

        var response = await _httpClient.PostAsJsonAsync(dnsUrl, payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Erro Cloudflare: {error}");
            return false;
        }

        return true;
    }

    private string GetZoneId() => "a3cab6b5bb2a78bce56fcf1b2df71691";
}