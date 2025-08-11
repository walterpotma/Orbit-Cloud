using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Api.Model
{
    [Table("account")]
    public class Account
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("plano")]
        public string? Plano { get; set; }
    }
}
