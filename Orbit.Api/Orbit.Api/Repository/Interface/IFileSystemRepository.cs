namespace Orbit.Api.Repository.Interface
{
    public interface IFileSystemRepository
    {
        Task<IEnumerable<DirectoryInfo>> GetDirectoriesAsync(string path);
        Task<IEnumerable<FileInfo>> GetFilesAsync(string path);
    }
}
