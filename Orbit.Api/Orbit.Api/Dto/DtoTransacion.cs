namespace Orbit.Api.Dto
{
    public class DtoTransacion
    {
        public int Id { get; set; }
        public int SubscriptionId { get; set; }
        public int PaymentMethodId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public string Gateway { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
