using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Api.Model
{
    [Table("account")]
    public class Account
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("GithubId")]
        public string? GithubId { get; set; }

        [Column("Name")]
        public string? Name { get; set; }

        [Column("Email")]
        public string? Email { get; set; }

        [Column("PasswordHash")]
        public string PasswordHash {  get; set; }

        [Column("Points")]
        public decimal Points { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
