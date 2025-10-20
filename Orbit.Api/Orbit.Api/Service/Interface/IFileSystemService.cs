using Orbit.Api.Dto.FileSystem;

namespace Orbit.Api.Service.Interface
{
    public interface IFileSystemService
    {
        Task<IEnumerable<DtoFileSystem>> ListDirectoryContentsAsync(string subPath);
    }
}
