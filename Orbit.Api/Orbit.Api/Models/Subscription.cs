using System.ComponentModel.DataAnnotations.Schema;

namespace Orbit.Api.Model
{
    [Table("subscription")]
    public class Subscription
    {
        [Column("Id")]
        public int Id { get; set; }

        [Column("AccountId")]
        public int PlanId { get; set; }

        [Column("PlanId")]
        public int PlanID { get; set; }

        [Column("Status")]
        public string Status { get; set; }

        [Column("CurrentPeriodStartsAt")]
        public DateTime CurrentPeriodEndsAt { get; set; }

        [Column("CanceledAt")]
        public DateTime CanceledAt { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
    }
}
