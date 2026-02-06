using Orbit.Application.DTOs.FileSystem;
using Orbit.Domain.Interfaces;
using Orbit.Application.Interfaces;
using Microsoft.Extensions.Configuration; // Necessário para IConfiguration

namespace Orbit.Infraestructure.Services
{
    public class FileSystemService : IFileSystemService
    {
        private readonly IFileSystemRepository _fileRepository;
        private readonly string _rootPath;

        public FileSystemService(IFileSystemRepository fileRepository, IConfiguration configuration)
        {
            _fileRepository = fileRepository;

            // Pega o caminho do appsettings ou usa um padrão seguro (/data no linux ou C:\OrbitData no windows)
            _rootPath = configuration["FileExplorer:RootPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "OrbitStorage");

            // Garante que a pasta raiz existe ao iniciar
            if (!Directory.Exists(_rootPath))
            {
                Directory.CreateDirectory(_rootPath);
            }
        }

        public async Task<IEnumerable<DtoFileSystem>> ListDirectoryContentsAsync(string subPath)
        {
            // 1. Valida e pega o caminho absoluto seguro
            // Se subPath for vazio "", ele pega a raiz. Se for "src/components", pega a pasta dentro da raiz.
            string safePath = GetAndValidateFullPath(subPath);

            // 2. Busca dados no repositório
            // Nota: Se o diretório não existir, o repositório vai lançar erro, que o controller captura (404)
            var directories = await _fileRepository.GetDirectoriesAsync(safePath);
            var files = await _fileRepository.GetFilesAsync(safePath);

            var entries = new List<DtoFileSystem>();

            // 3. Mapeia Diretórios
            foreach (var dir in directories)
            {
                entries.Add(new DtoFileSystem
                {
                    Name = dir.Name,
                    // O Path retornado para o front deve ser relativo à raiz (ex: "pasta/subpasta")
                    Path = GetRelativePath(dir.FullName),
                    Type = "Directory",
                    SizeInBytes = 0, // Pastas não têm tamanho direto simples
                    LastModified = dir.LastWriteTimeUtc
                });
            }

            // 4. Mapeia Arquivos
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

            // 5. Ordenação: Diretórios primeiro, depois Arquivos (Ordem alfabética)
            return entries
                .OrderByDescending(e => e.Type == "Directory") // True vale 1, False vale 0 -> Diretórios no topo
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

        // --- MÉTODOS AUXILIARES (O "Coração" da segurança) ---

        private string GetAndValidateFullPath(string subPath)
        {
            // Trata nulo como string vazia (raiz)
            subPath = subPath ?? string.Empty;

            // Remove barras do início para evitar confusão no Combine
            var cleanSubPath = subPath.TrimStart(['/', '\\']);

            // Combina Raiz + Caminho pedido
            string combinedPath = Path.Combine(_rootPath, cleanSubPath);

            // Resolve caminhos relativos maliciosos (ex: ../../windows)
            string fullPath = Path.GetFullPath(combinedPath);

            // Validação de Segurança: O caminho final DEVE começar com a _rootPath
            if (!fullPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Acesso negado. Você tentou acessar uma pasta fora do permitido.");
            }

            return fullPath;
        }

        private string GetRelativePath(string fullPath)
        {
            // Transforma "C:\Dados\Projeto\Src" em "Projeto\Src" (remove o prefixo da raiz)
            // O .Replace("\\", "/") garante que funcione bem no Front-end (Web usa barra normal)
            return Path.GetRelativePath(_rootPath, fullPath).Replace("\\", "/");
        }
    }
}