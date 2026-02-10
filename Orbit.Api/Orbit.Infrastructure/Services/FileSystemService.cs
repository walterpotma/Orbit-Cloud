using Orbit.Application.DTOs.FileSystem;
using Orbit.Domain.Interfaces;
using Orbit.Application.Interfaces;
using Microsoft.Extensions.Configuration; // Necessário para IConfiguration

namespace Orbit.Infrastructure.Services
{
    public class FileSystemService : IFileSystemService
    {
        private readonly IFileSystemRepository _fileRepository;
        private readonly string _rootPath;

        public FileSystemService(IFileSystemRepository fileRepository, IConfiguration configuration)
        {
            _fileRepository = fileRepository;

            _rootPath = configuration["FileExplorer:RootPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "OrbitStorage");

            if (!Directory.Exists(_rootPath))
            {
                Directory.CreateDirectory(_rootPath);
            }
        }

        public async Task<IEnumerable<DtoFileSystem>> ListDirectoryContentsAsync(string subPath)
        {
            string safePath = GetAndValidateFullPath(subPath);

            var directories = await _fileRepository.GetDirectoriesAsync(safePath);
            var files = await _fileRepository.GetFilesAsync(safePath);

            var entries = new List<DtoFileSystem>();

            foreach (var dir in directories)
            {
                entries.Add(new DtoFileSystem
                {
                    Name = dir.Name,
                    Path = GetRelativePath(dir.FullName),
                    Type = "Directory",
                    SizeInBytes = 0,
                    LastModified = dir.LastWriteTimeUtc
                });
            }

            foreach (var file in files)
            {
                entries.Add(new DtoFileSystem
                {
                    Name = file.Name,
                    Path = GetRelativePath(file.FullName),
                    Type = "File",
                    SizeInBytes = file.Length,
                    LastModified = file.LastWriteTimeUtc
                });
            }

            return entries
                .OrderByDescending(e => e.Type == "Directory")
                .ThenBy(e => e.Name);
        }

        public Task CreateDirectoryAsync(string relativePath)
        {
            string fullPath = GetAndValidateFullPath(relativePath);
            if (Directory.Exists(fullPath)) return Task.CompletedTask;
            Directory.CreateDirectory(fullPath);
            return Task.CompletedTask;
        }

        public async Task CreateFileAsync(string relativePath, string content = "")
        {
            string fullPath = GetAndValidateFullPath(relativePath);
            string parentDir = Path.GetDirectoryName(fullPath)!;

            if (!Directory.Exists(parentDir))
            {
                Directory.CreateDirectory(parentDir);
            }

            await File.WriteAllTextAsync(fullPath, content);
        }

        private string GetAndValidateFullPath(string subPath)
        {
            subPath = subPath ?? string.Empty;

            var cleanSubPath = subPath.TrimStart(['/', '\\']);

            string combinedPath = Path.Combine(_rootPath, cleanSubPath);

            string fullPath = Path.GetFullPath(combinedPath);

            if (!fullPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Acesso negado. Você tentou acessar uma pasta fora do permitido.");
            }

            return fullPath;
        }

        private string GetRelativePath(string fullPath)
        {
            return Path.GetRelativePath(_rootPath, fullPath).Replace("\\", "/");
        }
    }
}