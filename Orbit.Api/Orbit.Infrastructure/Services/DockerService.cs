using Microsoft.Extensions.Configuration;
using Orbit.Application.Helpers;
using Orbit.Application.Interfaces;
using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using Docker.DotNet;
using Docker.DotNet.Models;
using System.Formats.Tar;
using System.Threading;

namespace Orbit.Infrastructure.Services
{
    public class DockerService : IDockerService
    {
        private readonly IConfiguration _configuration;
        public DockerService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private const string BaseClonePath = "/data/archive/clients";

        public async Task GenerateDockerfile(string githubId, string repoName, string appName)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", repoName);

            if (!Directory.Exists(sourcePath))
                throw new DirectoryNotFoundException($"ERRO CRÍTICO: Pasta do repositório não encontrada: {sourcePath}");

            Console.WriteLine($"[NIXPACKS] Detectando stack e gerando Dockerfile em {sourcePath}...");

            var processInfo = new ProcessStartInfo
            {
                FileName = "nixpacks",
                Arguments = "plan .", // 'plan' substitui o antigo 'generate'
                WorkingDirectory = sourcePath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };

            process.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[NIXPACKS-OUT] {e.Data}"); };
            process.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[NIXPACKS-ERR] {e.Data}"); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"Nixpacks falhou ao gerar plano (Exit Code {process.ExitCode}).");

            var dockerfilePath = Path.Combine(sourcePath, ".nixpacks", "Dockerfile");

            if (File.Exists(dockerfilePath))
            {
                Console.WriteLine($"[NIXPACKS] Sucesso! Dockerfile gerado em: {dockerfilePath}");
            }
            else
            {
                Console.WriteLine($"[ERRO] Dockerfile não foi encontrado em {dockerfilePath}. Verifique as permissões de escrita.");
                throw new FileNotFoundException("O Nixpacks terminou, mas o arquivo Dockerfile não foi gerado.");
            }
        }
        public async Task GenerateImage(string githubId, string appName, string version)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", appName);
            var tag = $"{appName.ToLower()}:{version}";

            if (!Directory.Exists(sourcePath))
                throw new DirectoryNotFoundException($"Caminho não encontrado: {sourcePath}");

            Console.WriteLine($"[DOCKER-CLI] Iniciando build da imagem {tag}...");

            // O comando aponta para o Dockerfile que o Nixpacks gerou em .nixpacks/Dockerfile
            var processInfo = new ProcessStartInfo
            {
                FileName = "docker",
                Arguments = $"build -t {tag} -f .nixpacks/Dockerfile .",
                WorkingDirectory = sourcePath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };

            // Captura os logs do Docker em tempo real para o console do Hayom
            process.OutputDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[DOCKER-OUT] {e.Data}"); };
            process.ErrorDataReceived += (s, e) => { if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[DOCKER-ERR] {e.Data}"); };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
                throw new Exception($"Docker build falhou com código {process.ExitCode}");

            Console.WriteLine($"[API] Imagem {tag} gerada com sucesso via CLI!");
        }

        private async Task CreateTarball(string sourceDir, string tarFilePath)
        {
            if (File.Exists(tarFilePath)) File.Delete(tarFilePath);
            await Task.Run(() => TarFile.CreateFromDirectory(sourceDir, tarFilePath, false));
        }
    }
}