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
            // 1. Define o caminho exato onde o código está
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", repoName);

            // Validação de segurança
            if (!Directory.Exists(sourcePath))
            {
                throw new DirectoryNotFoundException($"ERRO CRÍTICO: O diretório do código não existe: {sourcePath}. O clone falhou?");
            }

            Console.WriteLine($"[NIXPACKS] Gerando Dockerfile para {appName} na pasta {sourcePath}...");

            // 2. Configura o processo para rodar o nixpacks
            // Comando equivalente: nixpacks plan /caminho/do/app --dockerfile
            var processInfo = new ProcessStartInfo
            {
                FileName = "nixpacks",
                Arguments = $"plan . --dockerfile", // O ponto (.) indica o diretório atual (WorkingDirectory)
                WorkingDirectory = sourcePath,      // Define a pasta de execução
                RedirectStandardOutput = true,      // Precisamos capturar o texto do Dockerfile
                RedirectStandardError = true,       // Precisamos capturar erros
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var dockerfileContent = new StringBuilder();

            using var process = new Process { StartInfo = processInfo };

            // Captura a saída (que será o conteúdo do Dockerfile)
            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    dockerfileContent.AppendLine(e.Data);
                }
            };

            // Captura erros ou logs informativos do nixpacks
            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    // Nixpacks joga logs de "planning" no stderr, então só logamos, não jogamos exception
                    Console.WriteLine($"[NIXPACKS-LOG] {e.Data}");
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"Nixpacks falhou com código de saída {process.ExitCode}. Verifique os logs acima.");
            }

            // 3. Salva o conteúdo capturado em um arquivo 'Dockerfile' na raiz do repo
            var dockerfilePath = Path.Combine(sourcePath, "Dockerfile");
            await File.WriteAllTextAsync(dockerfilePath, dockerfileContent.ToString());

            Console.WriteLine($"[NIXPACKS] Dockerfile salvo com sucesso em: {dockerfilePath}");
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