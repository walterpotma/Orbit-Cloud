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
                Arguments = "generate .",
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
            // 1. Monta o caminho automaticamente baseado na sua estrutura do Xeon
            // /data/archive/clients/{githubId}/tmp/{appName}
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", appName);

            if (!Directory.Exists(sourcePath))
                throw new DirectoryNotFoundException($"[ERRO] Pasta do projeto não encontrada para build: {sourcePath}");

            using var config = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock"));
            using var client = config.CreateClient();

            Console.WriteLine($"[DOCKER] Iniciando build da imagem: {appName.ToLower()}:{version}");

            // Usamos o Path.GetTempPath() para não sujar a pasta do cliente com o arquivo .tar
            var tarContextPath = Path.Combine(Path.GetTempPath(), $"{githubId}_{appName}_{version}.tar");

            try
            {
                // 2. Empacota a pasta tmp do cliente
                await CreateTarball(sourcePath, tarContextPath);

                using var tarStream = File.OpenRead(tarContextPath);

                var buildParams = new ImageBuildParameters
                {
                    Tags = new List<string> { $"{appName.ToLower()}:{version}" },
                    // O Dockerfile gerado pelo Nixpacks está dentro da pasta oculta .nixpacks
                    Dockerfile = ".nixpacks/Dockerfile",
                    Remove = true,
                    ForceRemove = true
                };

                // 3. Dispara o Build nativo
                // Em algumas versões do SDK, o método de extensão chama-se apenas:
                await client.Images.BuildImageFromBuildContextAsync(tarStream, buildParams, progress, CancellationToken.None);

                Console.WriteLine($"[API] Imagem {appName.ToLower()}:{version} construída com sucesso no Hayom!");
            }
            finally
            {
                // Limpeza do arquivo temporário
                if (File.Exists(tarContextPath)) File.Delete(tarContextPath);
            }
        }

        private async Task CreateTarball(string sourceDir, string tarFilePath)
        {
            if (File.Exists(tarFilePath)) File.Delete(tarFilePath);
            await Task.Run(() => TarFile.CreateFromDirectory(sourceDir, tarFilePath, false));
        }
    }
}