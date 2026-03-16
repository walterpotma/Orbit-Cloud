using System;
using System.Collections.Generic;

namespace Orbit.Application.DTOs.Prometheus
{
    public class MetricPoint
    {
        public DateTime Time { get; set; }
        public double Value { get; set; }
    }

    public class PodMetricGroup
    {
        public string PodName { get; set; } = string.Empty;
        public List<MetricPoint> Data { get; set; } = new();
    }

    public class DeploymentMetricsResponse
    {
        public List<MetricPoint> TotalUsage { get; set; } = new();
        public List<PodMetricGroup> PerPodUsage { get; set; } = new();
    }
}