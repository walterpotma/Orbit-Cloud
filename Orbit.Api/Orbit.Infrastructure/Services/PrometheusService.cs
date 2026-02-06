using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Orbit.Application.DTOs; // <--- Importante: Usa o DTO da Application
using Orbit.Application.Interfaces.Services;

namespace Orbit.Infrastructure.Services // Padronizado para Infrastructure
{
    public class PrometheusService : IPrometheusService
    {
        private readonly HttpClient _http;
        private const string PROMETHEUS_URL = "http://prometheus-server.monitoring.svc.cluster.local";

        public PrometheusService(IHttpClientFactory httpClientFactory)
        {
            _http = httpClientFactory.CreateClient();
        }

        public async Task<List<MetricPoint>> GetCpuUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            // Note as aspas escapadas corretamente para C#
            var promQl = $"sum(rate(container_cpu_usage_seconds_total{{namespace=\"{namespaceName}\", container!=\"\"}}[5m]))";
            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={promQl}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        public async Task<List<MetricPoint>> GetMemoryUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            var promQl = $"sum(container_memory_working_set_bytes{{namespace=\"{namespaceName}\", container!=\"\"}})";
            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={promQl}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        private async Task<List<MetricPoint>> FetchAndParse(string url)
        {
            try
            {
                var response = await _http.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new List<MetricPoint>();

                var jsonString = await response.Content.ReadAsStringAsync();
                return ParsePrometheusResponse(jsonString);
            }
            catch
            {
                return new List<MetricPoint>();
            }
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
                // Ignora falhas de parse
            }
            return result;
        }
    }

    // REMOVIDO: public class MetricPoint { ... } 
    // (Já movemos para Orbit.Application/DTOs/MetricPoint.cs)
}