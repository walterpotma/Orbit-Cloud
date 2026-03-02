public class DeploymentMetricsResponse
{
    public List<MetricPoint> TotalUsage { get; set; } = new();
    public List<PodMetricGroup> PerPodUsage { get; set; } = new();
}

public class PodMetricGroup
{
    public string PodName { get; set; }
    public List<MetricPoint> Data { get; set; } = new();
}