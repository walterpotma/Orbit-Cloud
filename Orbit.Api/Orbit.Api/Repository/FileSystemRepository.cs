using Orbit.Api.Repository.Interface;

namespace Orbit.Api.Repository
{
    public class FileSystemRepository : IFileSystemRepository
    {
        public Task<IEnumerable<DirectoryInfo>> GetDirectoriesAsync(string path)
        {
            var directoryInfo = new DirectoryInfo(path);
            if (!directoryInfo.Exists)
            {
                throw new DirectoryNotFoundException($"Diretório não encontrado: {path}");
            }
            return Task.FromResult(directoryInfo.GetDirectories().AsEnumerable());
        }

        public Task<IEnumerable<FileInfo>> GetFilesAsync(string path)
        {
            var directoryInfo = new DirectoryInfo(path);
            if (!directoryInfo.Exists)
            {
                throw new DirectoryNotFoundException($"Diretório não encontrado: {path}");
            }
            return Task.FromResult(directoryInfo.GetFiles().AsEnumerable());
        }
    }
}
