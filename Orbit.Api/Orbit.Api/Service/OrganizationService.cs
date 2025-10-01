using Orbit.Api.Dto;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class OrganizationService
    {
        IOrganizationRepository _organizationRepository;

        public OrganizationService(IOrganizationRepository organizationRepository)
        {
            _organizationRepository = organizationRepository;
        }

        public async Task<List<DtoOrganization>> GetAll()
        {
            var organizations = await _organizationRepository.GetAll();
            return organizations.Select(o => new DtoOrganization
            {
                Id = o.Id,
                Name = o.Name,
                Description = o.Description
            }).ToList();
        }

        public async Task<DtoOrganization> GetById(int id)
        {
            var organization = await _organizationRepository.GetById(id);
            if (organization == null) return null;
            return new DtoOrganization
            {
                Id = organization.Id,
                Name = organization.Name,
                Description = organization.Description
            };
        }

        public async Task<DtoOrganization> Create(DtoOrganization dtoOrganization)
        {
            var organization = new Model.Organization
            {
                Name = dtoOrganization.Name,
                Description = dtoOrganization.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            var createdOrganization = await _organizationRepository.Create(organization);
            dtoOrganization.Id = createdOrganization.Id;
            return dtoOrganization;
        }

        public async Task<DtoOrganization> Update(DtoOrganization dtoOrganization)
        {
            var organization = await _organizationRepository.GetById(dtoOrganization.Id);
            if (organization == null) return null;
            organization.Name = dtoOrganization.Name;
            organization.Description = dtoOrganization.Description;
            organization.UpdatedAt = DateTime.UtcNow;
            var updatedOrganization = await _organizationRepository.Update(organization);
            return new DtoOrganization
            {
                Id = updatedOrganization.Id,
                Name = updatedOrganization.Name,
                Description = updatedOrganization.Description
            };
        }

        public async Task<bool> Delete(int id)
        {
            return await _organizationRepository.Delete(id);
        }
    }
}
