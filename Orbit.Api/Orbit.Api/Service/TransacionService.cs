using Orbit.Api.Dto.subscription;
using Orbit.Api.Model;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Service
{
    public class TransacionService
    {
        private readonly ITransacionRepository _transacionRepository;
        public TransacionService(ITransacionRepository transacionRepository)
        {
            _transacionRepository = transacionRepository;
        }
        public async Task<List<DtoTransacion>> GetAll()
        {
            var transacions = await _transacionRepository.GetAll();
            return transacions.Select(t => new DtoTransacion
            {
                Id = t.Id,
                SubscriptionId = t.SubscriptionId,
                PaymentMethodId = t.PaymentMethodId,
                Amount = t.Amount,
                Status = t.Status,
                Gateway = t.Gateway
            }).ToList();
        }
        public async Task<DtoTransacion?> GetById(int id)
        {
            var t = await _transacionRepository.GetById(id);
            if (t == null) return null;
            return new DtoTransacion
            {
                Id = t.Id,
                SubscriptionId = t.SubscriptionId,
                PaymentMethodId = t.PaymentMethodId,
                Amount = t.Amount,
                Status = t.Status,
                Gateway = t.Gateway
            };
        }
        public async Task<DtoTransacion> Create(DtoTransacion dtoTransacion)
        {
            var transacion = new Transacion
            {
                SubscriptionId = dtoTransacion.SubscriptionId,
                PaymentMethodId = dtoTransacion.PaymentMethodId,
                Amount = dtoTransacion.Amount,
                Status = dtoTransacion.Status,
                Gateway = dtoTransacion.Gateway
            };
            var t = await _transacionRepository.Create(transacion);
            return new DtoTransacion
            {
                Id = t.Id,
                SubscriptionId = t.SubscriptionId,
                PaymentMethodId = t.PaymentMethodId,
                Amount = t.Amount,
                Status = t.Status,
                Gateway = t.Gateway
            };
        }
        public async Task<DtoTransacion?> Update(DtoTransacion dtoTransacion)
        {
            var existingTransacion = await _transacionRepository.GetById(dtoTransacion.Id);
            if (existingTransacion == null) return null;
            existingTransacion.SubscriptionId = dtoTransacion.SubscriptionId;
            existingTransacion.PaymentMethodId = dtoTransacion.PaymentMethodId;
            existingTransacion.Amount = dtoTransacion.Amount;
            existingTransacion.Status = dtoTransacion.Status;
            existingTransacion.Gateway = dtoTransacion.Gateway;
            var t = await _transacionRepository.Update(existingTransacion.Id, existingTransacion);
            return new DtoTransacion
            {
                Id = t.Id,
                SubscriptionId = t.SubscriptionId,
                PaymentMethodId = t.PaymentMethodId,
                Amount = t.Amount,
                Status = t.Status,
                Gateway = t.Gateway
            };
        }
        public async Task<bool> Delete(int id)
        {
            var transacion = await _transacionRepository.GetById(id);
            if (transacion == null) return false;
            return await _transacionRepository.Delete(id);
        }
    }
}
