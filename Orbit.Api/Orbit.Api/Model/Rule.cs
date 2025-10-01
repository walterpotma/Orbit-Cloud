using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Nodes;

namespace Orbit.Api.Model
{
    [Table("rule")]
    public class Rule
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("AccountId")]
        public int AccountId { get; set; }

        [Column("OrganizationId")]
        public int OrganizationId { get; set; }

        [Column("Access")]
        public List<String> Access {  get; set; }
    }
}
