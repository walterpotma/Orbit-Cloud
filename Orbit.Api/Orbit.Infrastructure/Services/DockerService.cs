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
            var outputPath = Path.Combine(sourcePath, "nixpacks");
            var scriptPath = _configuration["FileExplorer:NixPack"];

            // ... (execução do processo igual você já tem) ...
            await process.WaitForExitAsync();

            // O Nixpacks build --out SEMPRE cria uma subpasta .nixpacks lá dentro
            var dockerfilePath = Path.Combine(outputPath, ".nixpacks", "Dockerfile");

            // Agora o File.Exists vai dar TRUE de primeira!
            if (File.Exists(dockerfilePath))
            {
                Console.WriteLine($"[ORBIT] Sucesso! Dockerfile encontrado em: {dockerfilePath}");
            }
            else
            {
                throw new FileNotFoundException($"Dockerfile não encontrado. Caminho esperado: {dockerfilePath}");
            }
        }

        public async Task GenerateImage(string githubId, string appName, string version)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", appName);
            // IMPORTANTE: Ajuste aqui também para o build do Docker encontrar o arquivo
            var dockerfilePath = Path.Combine(sourcePath, "nixpacks", ".nixpacks", "Dockerfile");
            var tag = $"{appName.ToLower()}:{version}";

            var processInfo = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = $"build -t {tag} -f {dockerfilePath} {sourcePath}",
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