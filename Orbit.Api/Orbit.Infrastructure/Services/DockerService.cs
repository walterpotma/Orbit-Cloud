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
            var outputPath = Path.Combine(sourcePath);
            var scriptPath = _configuration["FileExplorer:NixPack"];

            if (!Directory.Exists(sourcePath))
                throw new DirectoryNotFoundException($"Pasta não encontrada: {sourcePath}");

            Console.WriteLine($"[ORBIT] Iniciando geração via Script: {scriptPath}");

            var processInfo = new ProcessStartInfo
            {
                FileName = "/bin/bash",
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

            // --- VALIDAÇÃO COM RETRY E FORÇA BRUTA ---
            var dockerfilePath = Path.Combine(outputPath, ".nixpacks", "Dockerfile");
            bool found = false;

            for (int i = 0; i < 5; i++)
            {
                // Força o SO a atualizar os metadados da pasta
                if (Directory.Exists(outputPath))
                {
                    new DirectoryInfo(outputPath).Refresh();
                }

                if (File.Exists(dockerfilePath))
                {
                    found = true;
                    break;
                }

                Console.WriteLine($"[DEBUG] Aguardando sync do volume... ({i + 1}/5)");

                // HACK DE SRE: Executa um 'ls' via Shell para forçar o Kernel a indexar o arquivo
                try
                {
                    var syncProcess = Process.Start(new ProcessStartInfo
                    {
                        FileName = "ls",
                        Arguments = $"-la {outputPath}",
                        RedirectStandardOutput = true,
                        UseShellExecute = false
                    });
                    await syncProcess!.WaitForExitAsync();
                }
                catch { /* ignore */ }

                await Task.Delay(1500); // Aumentei um pouco o delay
            }

            if (!found)
            {
                if (Directory.Exists(outputPath))
                {
                    // Listagem profunda para o log
                    var allFiles = Directory.GetFiles(outputPath, "*", SearchOption.AllDirectories);
                    Console.WriteLine($"[DEBUG] Pasta existe, mas arquivos detectados pelo .NET são: {string.Join(", ", allFiles)}");

                    // Tenta ver se o arquivo está com outro nome (nixpacks às vezes cria subpastas)
                    foreach (var f in allFiles)
                    {
                        if (f.EndsWith("Dockerfile"))
                        {
                            Console.WriteLine($"[DEBUG] ACHEI! O arquivo estava em: {f}");
                            // Opcional: dockerfilePath = f; found = true; break;
                        }
                    }
                }

                if (!found)
                    throw new FileNotFoundException($"Dockerfile não encontrado em: {dockerfilePath}");
            }

            Console.WriteLine($"[ORBIT] Dockerfile pronto em {dockerfilePath}!");
        }
        public async Task GenerateImage(string githubId, string appName, string version)
        {
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", appName);
            var outputPath = Path.Combine(sourcePath, ".nixpacks"); // Pasta gerada na etapa anterior
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