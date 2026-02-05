namespace Orbit.Domain.Interfaces
{
    public interface IFileSystemRepository
    {
        Task<IEnumerable<DirectoryInfo>> GetDirectoriesAsync(string path);
        Task<IEnumerable<FileInfo>> GetFilesAsync(string path);
    }
}
