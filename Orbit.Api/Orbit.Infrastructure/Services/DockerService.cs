using Microsoft.Extensions.Configuration;
using Orbit.Application.Interfaces;
using System.Diagnostics;

namespace Orbit.Infrastructure.Services
{
    public class DockerService : IDockerService
    {
        private readonly IConfiguration _configuration;
        private const string BaseClonePath = "/data/archive/clients";

        public DockerService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task GenerateDockerfile(string githubId, string repoName, string appName)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", repoName);
            // IMPORTANTE: Use o mesmo nome que o seu script .sh usa internamente
            var outputPath = Path.Combine(sourcePath, "nixpacks"); 
            var scriptPath = _configuration["FileExplorer:NixPack"];

            if (!Directory.Exists(sourcePath))
                throw new DirectoryNotFoundException($"Pasta não encontrada: {sourcePath}");

            Console.WriteLine($"[ORBIT] Iniciando geração via Script: {scriptPath}");

            var processInfo = new ProcessStartInfo
            {
                FileName = "/bin/bash",
                // Passamos os argumentos: 1. Onde está o código, 2. Onde salvar o Dockerfile
                Arguments = $"{scriptPath} {sourcePath} {outputPath}",
                WorkingDirectory = sourcePath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };

            process.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[SH-OUT] {e.Data}"); };
            process.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[SH-ERR] {e.Data}"); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"O script de build falhou com código {process.ExitCode}");

            // --- VALIDAÇÃO COM RETRY (O segredo para Volumes K8s) ---
            var dockerfilePath = Path.Combine(outputPath, "Dockerfile");
            bool found = false;

            for (int i = 0; i < 5; i++)
            {
                if (File.Exists(dockerfilePath)) { found = true; break; }
                Console.WriteLine($"[DEBUG] Aguardando sync do volume... ({i+1}/5)");
                await Task.Delay(1000);
            }

            if (!found)
            {
                // Debug final se falhar
                if (Directory.Exists(outputPath))
                {
                    var files = Directory.GetFiles(outputPath);
                    Console.WriteLine($"[DEBUG] Pasta existe, mas arquivos são: {string.Join(", ", files)}");
                }
                throw new FileNotFoundException($"Dockerfile não encontrado em: {dockerfilePath}");
            }

            Console.WriteLine($"[ORBIT] Dockerfile pronto para o próximo passo!");
        }

        public async Task GenerateImage(string githubId, string appName, string version)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", appName);
            var outputPath = Path.Combine(sourcePath, "nixpacks"); // Pasta gerada na etapa anterior
            var tag = $"{appName.ToLower()}:{version}";

            Console.WriteLine($"[DOCKER] Buildando imagem {tag}...");

            var processInfo = new ProcessStartInfo
            {
                FileName = "docker",
                // AGORA APONTAMOS PARA A PASTA CERTA QUE O SCRIPT CRIOU
                Arguments = $"build -t {tag} -f {outputPath}/Dockerfile {sourcePath}",
                WorkingDirectory = sourcePath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };

            process.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[DOCKER-OUT] {e.Data}"); };
            process.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[DOCKER-ERR] {e.Data}"); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"Docker build falhou!");

            Console.WriteLine($"[ORBIT] Imagem {tag} gerada com sucesso!");
        }
    }
}