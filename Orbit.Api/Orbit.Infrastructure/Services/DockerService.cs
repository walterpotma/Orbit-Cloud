using Microsoft.Extensions.Configuration; // <--- Importante
using Orbit.Application.Helpers;
using Orbit.Application.Interfaces;
using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

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
                throw new DirectoryNotFoundException($"ERRO CRÍTICO: Pasta não encontrada: {sourcePath}");

            Console.WriteLine($"[NIXPACKS] Gerando Dockerfile em {sourcePath}...");

            // CORREÇÃO: Usamos uma pasta normal (sem ponto na frente) para evitar problemas de arquivo oculto
            var outputDir = "docker-build";

            var processInfo = new ProcessStartInfo
            {
                FileName = "nixpacks",
                // Salva na pasta 'docker-build'
                Arguments = $"build . --out {outputDir}",
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
                throw new Exception($"Nixpacks falhou (Exit Code {process.ExitCode}).");

            // Verifica o arquivo no novo local
            var dockerfilePath = Path.Combine(sourcePath, outputDir, "Dockerfile");

            if (File.Exists(dockerfilePath))
            {
                Console.WriteLine($"[NIXPACKS] Sucesso! Dockerfile criado em: {dockerfilePath}");
            }
            else
            {
                // Debug avançado caso falhe novamente
                Console.WriteLine($"[ERRO] Dockerfile não encontrado em {dockerfilePath}. Conteúdo da pasta {outputDir}:");
                var dirToCheck = Path.Combine(sourcePath, outputDir);
                if (Directory.Exists(dirToCheck))
                {
                    var files = Directory.GetFileSystemEntries(dirToCheck);
                    foreach (var file in files) Console.WriteLine($" - {file}");
                }
                else
                {
                    Console.WriteLine($"A pasta {dirToCheck} nem sequer foi criada.");
                }

                throw new FileNotFoundException($"O Nixpacks rodou, mas o Dockerfile não foi gerado.");
            }
        }
        public async Task GenerateImage(string githubId, string appName, string version, string appPath)
        {
            var scriptPath = _configuration["FileExplorer:BuildPack"];

            if (string.IsNullOrEmpty(scriptPath))
            {
                throw new Exception("ERRO: A configuração 'FileExplorer:ScriptPath' não foi encontrada no appsettings.json.");
            }

            await ShellHelper.MakeExecutableAsync(scriptPath);

            var args = $"{githubId} {appName} {version} {appPath}";

            Console.WriteLine($"[API] construindo image para {appName} em {scriptPath}...");

            var result = await ShellHelper.RunScriptAsync(scriptPath, args);

            if (result.ExitCode == 0)
            {
                Console.WriteLine("[API] image construida com sucesso!");
            }
            else
            {
                Console.WriteLine($"[API] Erro ao gerar: {result.Error}");
                throw new Exception($"Falha na geração da image: {result.Error}");
            }
        }
    }
}