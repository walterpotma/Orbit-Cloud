using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Api.Model
{
    [Table("organization")]
    public class Organization
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("Description")]
        public string Description { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("UpdateAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
