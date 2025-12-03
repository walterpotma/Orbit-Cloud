using Orbit.Api.Dto.FileSystem;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Service
{
    public class FileSystemService : IFileSystemService
    {
        private readonly IFileSystemRepository _fileRepository;
        private readonly string _rootPath; // O caminho base seguro (ex: /srv/meus-arquivos)

        public FileSystemService(IFileSystemRepository fileRepository, IConfiguration configuration)
        {
            _fileRepository = fileRepository;
            _rootPath = configuration["FileExplorer:RootPath"] ??
                        throw new InvalidOperationException("RootPath do FileExplorer não está configurado");

            // Garante que o caminho raiz exista
            if (!Directory.Exists(_rootPath))
            {
                throw new DirectoryNotFoundException($"O RootPath configurado não existe: {_rootPath}");
            }
        }

        public async Task<IEnumerable<DtoFileSystem>> ListDirectoryContentsAsync(string subPath)
        {
            // --- ETAPA DE SEGURANÇA CRUCIAL ---
            string safePath = GetAndValidateFullPath(subPath);

            // Obter os dados do repositório
            var directories = await _fileRepository.GetDirectoriesAsync(safePath);
            var files = await _fileRepository.GetFilesAsync(safePath);

            var entries = new List<DtoFileSystem>();

            // Mapear diretórios para DTOs
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

            // Mapear arquivos para DTOs
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

            return entries.OrderBy(e => e.Type).ThenBy(e => e.Name);
        }

        private string GetAndValidateFullPath(string subPath)
        {
            // Limpa o subPath para evitar ' ' ou '/' no início
            var cleanSubPath = subPath.TrimStart(['/', '\\']);

            // Combina o caminho raiz com o sub-caminho solicitado
            string combinedPath = Path.Combine(_rootPath, cleanSubPath);

            // Converte para um caminho absoluto e canônico (ex: resolve '..')
            string fullPath = Path.GetFullPath(combinedPath);

            // A VALIDAÇÃO: 
            // Verifica se o caminho final ainda está DENTRO do nosso _rootPath.
            if (!fullPath.StartsWith(_rootPath, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("Acesso negado. Tentativa de Path Traversal.");
            }

            return fullPath;
        }

        // Função auxiliar para retornar o caminho relativo, não o caminho completo do servidor
        private string GetRelativePath(string fullPath)
        {
            return Path.GetRelativePath(_rootPath, fullPath).Replace("\\", "/");
        }

        public Task CreateDirectoryAsync(string relativePath)
        {
            // 1. Valida e pega o caminho completo seguro
            string fullPath = GetAndValidateFullPath(relativePath);

            // 2. Se já existe, não faz nada (ou pode lançar erro se preferir)
            if (Directory.Exists(fullPath))
            {
                return Task.CompletedTask;
            }

            // 3. Cria o diretório
            Directory.CreateDirectory(fullPath);
            return Task.CompletedTask;
        }

        public async Task CreateFileAsync(string relativePath, string content = "")
        {
            // 1. Valida e pega o caminho completo seguro
            string fullPath = GetAndValidateFullPath(relativePath);

            // 2. Garante que a pasta pai exista
            string parentDir = Path.GetDirectoryName(fullPath)!;
            if (!Directory.Exists(parentDir))
            {
                Directory.CreateDirectory(parentDir);
            }

            // 3. Cria/Sobrescreve o arquivo com o conteúdo
            await File.WriteAllTextAsync(fullPath, content);
        }
    }
}
