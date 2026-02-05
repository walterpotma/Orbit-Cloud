using Orbit.Application.DTOs.FileSystem;

namespace Orbit.Application.Interfaces
{
    public interface IFileSystemService
    {
        Task<IEnumerable<DtoFileSystem>> ListDirectoryContentsAsync(string subPath);
        Task CreateDirectoryAsync(string relativePath);
        Task CreateFileAsync(string relativePath, string content = "");
    }
}
