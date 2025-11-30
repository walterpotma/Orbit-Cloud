using Newtonsoft.Json;
using System.Collections.Generic;

namespace k8s.Models
{
    public class V1PodMetricsList : KubernetesObject
    {
        [JsonProperty(PropertyName = "metadata")]
        public V1ListMeta Metadata { get; set; }

        [JsonProperty(PropertyName = "items")]
        public IList<V1PodMetrics> Items { get; set; }
    }

    public class V1PodMetrics : KubernetesObject
    {
        [JsonProperty(PropertyName = "metadata")]
        public V1ObjectMeta Metadata { get; set; }

        [JsonProperty(PropertyName = "timestamp")]
        public System.DateTime? Timestamp { get; set; }

        [JsonProperty(PropertyName = "window")]
        public string Window { get; set; }

        [JsonProperty(PropertyName = "containers")]
        public IList<V1ContainerMetrics> Containers { get; set; }
    }

    public class V1ContainerMetrics
    {
        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "usage")]
        public IDictionary<string, ResourceQuantity> Usage { get; set; }
    }
}