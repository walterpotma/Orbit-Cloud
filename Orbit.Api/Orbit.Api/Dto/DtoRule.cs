namespace Orbit.Api.Dto
{
    public class DtoRule
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public int OrganizationId { get; set; }
        public List<string> Access { get; set; }
    }
}
