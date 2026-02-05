using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Orbit.Api.Model
{
    [Table("plan")]
    public class Plan
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("Name")]
        public string Name { get; set; }

        [Column("Resource")]
        public List<ResourceItem> Resource { get; set; }

        public class ResourceItem
        {
            [JsonPropertyName("cpu")]
            public int? Cpu { get; set; }

            [JsonPropertyName("ram")]
            public int? Ram { get; set; }

            [JsonPropertyName("price")]
            public decimal Price { get; set; }
        }
    }
}
