﻿namespace Orbit.Api.Dto.Registry
{
    public class DtoImage
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new List<string>();
    }
}
