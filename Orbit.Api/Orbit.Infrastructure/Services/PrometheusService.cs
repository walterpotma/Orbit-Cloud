using System.Text.Json.Nodes;

namespace Orbit.Infraestrutura.Services
{
    public class PrometheusService
    {
        private readonly HttpClient _http;

        // Se estiver testando localmente com port-forward, use: "http://localhost:9090"
        private const string PROMETHEUS_URL = "http://prometheus-server.monitoring.svc.cluster.local";

        public PrometheusService(IHttpClientFactory httpClientFactory)
        {
            _http = httpClientFactory.CreateClient();
        }

        // --- MÉTODO DE CPU ---
        public async Task<List<MetricPoint>> GetCpuUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            // Query CPU: sum(rate(container_cpu_usage_seconds_total...))
            var promQl = $"sum(rate(container_cpu_usage_seconds_total{{namespace=\"{namespaceName}\", container!=\"\"}}[5m]))";

            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={promQl}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        // --- MÉTODO DE MEMÓRIA (O QUE FALTOU) ---
        public async Task<List<MetricPoint>> GetMemoryUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            // Query RAM: sum(container_memory_working_set_bytes...)
            var promQl = $"sum(container_memory_working_set_bytes{{namespace=\"{namespaceName}\", container!=\"\"}})";

            // step=3600 (1 hora). Se quiser mais detalhe, mude para 900 (15 min)
            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={promQl}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        // --- MÉTODO AUXILIAR PRIVADO (Para não repetir código) ---
        private async Task<List<MetricPoint>> FetchAndParse(string url)
        {
            var response = await _http.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                return new List<MetricPoint>();

            var jsonString = await response.Content.ReadAsStringAsync();
            return ParsePrometheusResponse(jsonString);
        }

        private List<MetricPoint> ParsePrometheusResponse(string json)
        {
            var result = new List<MetricPoint>();

            try
            {
                var node = JsonNode.Parse(json);
                var values = node?["data"]?["result"]?[0]?["values"]?.AsArray();

                if (values == null) return result;

                foreach (var item in values)
                {
                    var timestamp = (long)item[0];
                    var valueStr = item[1].ToString();

                    if (double.TryParse(valueStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val))
                    {
                        result.Add(new MetricPoint
                        {
                            Time = DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime,
                            Value = val
                        });
                    }
                }
            }
            catch
            {
                // Ignora erros de parse
            }

            return result;
        }
    }

    public class MetricPoint
    {
        public DateTime Time { get; set; }
        public double Value { get; set; }
    }
}