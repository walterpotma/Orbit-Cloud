using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using System.Globalization;
using Orbit.Application.DTOs;
using Orbit.Application.Interfaces.Services;

namespace Orbit.Infrastructure.Services
{
    public class PrometheusService : IPrometheusService
    {
        private readonly HttpClient _http;
        // URL do serviço do Prometheus dentro do cluster K8s
        private const string PROMETHEUS_URL = "http://prometheus-server.monitoring.svc.cluster.local";

        public PrometheusService(IHttpClientFactory httpClientFactory)
        {
            _http = httpClientFactory.CreateClient();
        }

        public async Task<DeploymentMetricsResponse> GetCpuUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            // Query PromQL agrupada por pod: removemos o sum() global e usamos by(pod)
            var promQl = $"sum(rate(container_cpu_usage_seconds_total{{namespace=\"{namespaceName}\", container!=\"\"}}[5m])) by (pod)";
            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={Uri.EscapeDataString(promQl)}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        public async Task<DeploymentMetricsResponse> GetMemoryUsageLast24h(string namespaceName)
        {
            var end = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var start = DateTimeOffset.UtcNow.AddHours(-24).ToUnixTimeSeconds();

            // Query PromQL de memória agrupada por pod
            var promQl = $"sum(container_memory_working_set_bytes{{namespace=\"{namespaceName}\", container!=\"\"}}) by (pod)";
            var url = $"{PROMETHEUS_URL}/api/v1/query_range?query={Uri.EscapeDataString(promQl)}&start={start}&end={end}&step=3600";

            return await FetchAndParse(url);
        }

        private async Task<DeploymentMetricsResponse> FetchAndParse(string url)
        {
            try
            {
                var response = await _http.GetAsync(url);
                if (!response.IsSuccessStatusCode) return new DeploymentMetricsResponse();

                var jsonString = await response.Content.ReadAsStringAsync();
                return ParsePrometheusResponse(jsonString);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro na requisição ao Prometheus: {ex.Message}");
                return new DeploymentMetricsResponse();
            }
        }

        private DeploymentMetricsResponse ParsePrometheusResponse(string json)
        {
            var response = new DeploymentMetricsResponse();
            var totalsDict = new Dictionary<DateTime, double>();

            try
            {
                var node = JsonNode.Parse(json);
                var resultsArray = node?["data"]?["result"]?.AsArray();

                if (resultsArray == null) return response;

                foreach (var series in resultsArray)
                {
                    // Extrai o nome do pod da label 'pod' retornada pelo Prometheus
                    var podName = series["metric"]?["pod"]?.ToString() ?? "unknown-pod";
                    var values = series["values"]?.AsArray();

                    if (values == null) continue;

                    var podPoints = new List<MetricPoint>();

                    foreach (var item in values)
                    {
                        var timestamp = (long)item[0];
                        var time = DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime;
                        var valueStr = item[1]?.ToString();

                        if (double.TryParse(valueStr, NumberStyles.Any, CultureInfo.InvariantCulture, out double val))
                        {
                            var point = new MetricPoint { Time = time, Value = val };
                            podPoints.Add(point);

                            // Agregação para o TotalUsage (Soma dos pods no mesmo timestamp)
                            if (totalsDict.ContainsKey(time))
                                totalsDict[time] += val;
                            else
                                totalsDict[time] = val;
                        }
                    }

                    response.PerPodUsage.Add(new PodMetricGroup 
                    { 
                        PodName = podName, 
                        Data = podPoints 
                    });
                }

                // Converte o dicionário de somas para a lista TotalUsage, ordenada por tempo
                response.TotalUsage = totalsDict
                    .Select(x => new MetricPoint { Time = x.Key, Value = x.Value })
                    .OrderBy(x => x.Time)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao parsear resposta do Prometheus: {ex.Message}");
            }

            return response;
        }
    }
}