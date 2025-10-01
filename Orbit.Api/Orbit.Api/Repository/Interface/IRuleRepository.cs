﻿using Orbit.Api.Model;

namespace Orbit.Api.Repository.Interface
{
    public interface IRuleRepository
    {
        Task<List<Rule>> GetAll();
        Task<Rule> GetById(int id);
        Task<Rule> Create(Rule rule);
        Task<Rule> Update(Rule rule);
        Task<bool> Delete(int id);
    }
}
