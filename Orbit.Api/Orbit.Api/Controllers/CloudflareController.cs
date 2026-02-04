using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Orbit.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CloudflareController : ControllerBase
    {
        private readonly HttpClient _http;

        // =========================================================================
        // ⚠️ PREENCHA SEUS DADOS AQUI (Depois você move para o appsettings.json)
        // =========================================================================
        private const string CF_TOKEN = "7DmK3dqhLKCwTs8m-UoxPMCuMlP1h9N1GoIQkE8b"; // Token com permissão de DNS e Tunnel
        private const string ZONE_ID = "a3cab6b5bb2a78bce56fcf1b2df71691"; // ID da zona orbitcloud.com.br
        private const string ACCOUNT_ID = "5574573b7748e7868bb3bcb236f36f81";
        private const string TUNNEL_ID = "0e00cfd1-c368-4587-acd6-5a0a9f989e7b\r\n"; // ID do túnel k3s-hayom
        private const string DOMAIN_BASE = "crion.dev";
        // =========================================================================

        public CloudflareController(IHttpClientFactory httpClientFactory)
        {
            _http = httpClientFactory.CreateClient();
            _http.BaseAddress = new Uri("https://api.cloudflare.com/client/v4/");
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", CF_TOKEN);
        }

        [HttpPost("publish")]
        public async Task<IActionResult> PublishApp([FromBody] PublishRequest request)
        {
            try
            {
                // 1. Definições de Endereços
                // Subdomínio público: meu-app.orbitcloud.com.br
                string publicHostname = $"{request.Subdomain}.{DOMAIN_BASE}";

                // Endereço interno do Kubernetes: http://service.namespace.svc.cluster.local:80
                string internalK8sUrl = $"http://{request.ServiceName}.{request.Namespace}.svc.cluster.local:{request.Port}";

                // ---------------------------------------------------------
                // PASSO 1: CRIAR O REGISTRO DNS (CNAME)
                // ---------------------------------------------------------
                var dnsPayload = new
                {
                    type = "CNAME",
                    name = publicHostname,
                    content = $"{TUNNEL_ID}.cfargotunnel.com",
                    proxied = true, // Importante: Proxy ligado (nuvem laranja)
                    ttl = 1
                };

                var dnsResponse = await _http.PostAsJsonAsync($"zones/{ZONE_ID}/dns_records", dnsPayload);
                if (!dnsResponse.IsSuccessStatusCode)
                {
                    var error = await dnsResponse.Content.ReadAsStringAsync();
                    // Se der erro 409 (já existe), podemos ignorar e seguir, ou parar.
                    // Vou logar e seguir para garantir que a rota exista.
                    Console.WriteLine($"Aviso DNS: {error}");
                }

                // ---------------------------------------------------------
                // PASSO 2: ATUALIZAR A CONFIGURAÇÃO DO TÚNEL (ROTA)
                // ---------------------------------------------------------

                // 2.1 Baixar config atual
                var configUrl = $"accounts/{ACCOUNT_ID}/tunnels/{TUNNEL_ID}/configurations";
                var getResponse = await _http.GetAsync(configUrl);

                if (!getResponse.IsSuccessStatusCode)
                    return BadRequest("Erro ao baixar config do túnel: " + await getResponse.Content.ReadAsStringAsync());

                var configWrapper = await getResponse.Content.ReadFromJsonAsync<CloudflareConfigWrapper>();
                var config = configWrapper.Result;

                // 2.2 Verificar se a regra já existe para não duplicar
                bool jaExiste = config.Ingress.Any(r => r.Hostname == publicHostname);

                if (!jaExiste)
                {
                    var novaRegra = new IngressRule
                    {
                        Hostname = publicHostname,
                        Service = internalK8sUrl,
                        OriginRequest = new Dictionary<string, object>() // Configs padrão
                    };

                    // 2.3 INSERIR ANTES DO CATCH-ALL (A última regra que pega 404)
                    // Se a lista tiver itens, insere no penúltimo. Se vazia, add.
                    int index = config.Ingress.Count > 0 ? config.Ingress.Count - 1 : 0;
                    config.Ingress.Insert(index, novaRegra);

                    // 2.4 Subir a nova config (PUT)
                    // A API espera um objeto { "config": { ... } }
                    var putPayload = new { config = config };
                    var putResponse = await _http.PutAsJsonAsync(configUrl, putPayload);

                    if (!putResponse.IsSuccessStatusCode)
                        return BadRequest("Erro ao atualizar Túnel: " + await putResponse.Content.ReadAsStringAsync());
                }

                return Ok(new
                {
                    Message = "App publicado com sucesso!",
                    PublicUrl = $"https://{publicHostname}",
                    InternalTarget = internalK8sUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }

    // --- CLASSES AUXILIARES (DTOs) PARA FICAR TUDO NO MESMO ARQUIVO ---

    public class PublishRequest
    {
        public string Subdomain { get; set; }  // Ex: "documentos"
        public string ServiceName { get; set; } // Ex: "documentos"
        public string Namespace { get; set; }   // Ex: "u-201145284"
        public int Port { get; set; } = 80;     // Ex: 80
    }

    // Classes para mapear o JSON da Cloudflare
    public class CloudflareConfigWrapper
    {
        [JsonPropertyName("result")]
        public TunnelConfig Result { get; set; }
    }

    public class TunnelConfig
    {
        [JsonPropertyName("ingress")]
        public List<IngressRule> Ingress { get; set; } = new();
    }

    public class IngressRule
    {
        [JsonPropertyName("hostname")]
        public string Hostname { get; set; }

        [JsonPropertyName("service")]
        public string Service { get; set; }

        [JsonPropertyName("originRequest")]
        public Dictionary<string, object> OriginRequest { get; set; }
    }
}