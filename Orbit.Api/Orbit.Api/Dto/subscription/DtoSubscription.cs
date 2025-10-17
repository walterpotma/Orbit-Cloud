namespace Orbit.Api.Dto.subscription
{
    public class DtoSubscription
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public int PlanId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
