using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;

namespace safeWorkApi.service
{
    public class TempDataService
    {
        private readonly IMemoryCache _cache;

        public TempDataService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public void SetData(string key, string value)
        {
            _cache.Set(key, value, TimeSpan.FromHours(1)); // expira em 1h
        }

        public string? GetData(string key)
        {
            return _cache.TryGetValue(key, out string value) ? value : null;
        }

        public void RemoveData(string key)
        {
            _cache.Remove(key);
        }
    }
}