using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Api.Model
{
    [Table("transacion")]
    public class Transacion
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("SubscriptionId")]
        public int SubscriptionId { get; set; }

        [Column("PaymentMethodId")]
        public int PaymentMethodId { get; set; }

        [Column("Amount")]
        public decimal Amount { get; set; }

        [Column("Status")]
        public string Status { get; set; }

        [Column("GatewayTransacionId")]
        public string Gateway {  get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
    }
}
