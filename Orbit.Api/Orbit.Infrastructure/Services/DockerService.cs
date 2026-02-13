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

            // MUDANÇA: Salvar em uma subpasta específica (.nixpacks) para evitar confusão
            var processInfo = new ProcessStartInfo
            {
                FileName = "nixpacks",
                Arguments = "build . --out .nixpacks", // <--- Salva na subpasta
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

            // Verifica se o arquivo existe dentro da subpasta
            var dockerfilePath = Path.Combine(sourcePath, ".nixpacks", "Dockerfile");

            if (File.Exists(dockerfilePath))
            {
                Console.WriteLine($"[NIXPACKS] Sucesso! Dockerfile criado em: {dockerfilePath}");
            }
            else
            {
                // DEBUG: Se não achou, lista o que tem na pasta para entendermos o erro
                Console.WriteLine($"[ERRO] Dockerfile não encontrado em {dockerfilePath}. Conteúdo da pasta {sourcePath}:");
                var files = Directory.GetFileSystemEntries(sourcePath, "*", SearchOption.AllDirectories);
                foreach (var file in files) Console.WriteLine($" - {file}");

                throw new FileNotFoundException($"O Nixpacks rodou, mas o Dockerfile sumiu.");
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