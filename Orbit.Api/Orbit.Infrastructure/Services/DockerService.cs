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
            // Caminho: /data/archive/clients/{id}/tmp/{repoName}
            var sourcePath = Path.Combine(BaseClonePath, githubId, "tmp", repoName);

            if (!Directory.Exists(sourcePath))
            {
                throw new DirectoryNotFoundException($"ERRO CRÍTICO: O diretório do código não existe: {sourcePath}.");
            }

            Console.WriteLine($"[NIXPACKS] Gerando Dockerfile para {appName} na pasta {sourcePath}...");

            // CORREÇÃO: Removemos '--no-build'. 
            // O uso de '--out .' já instrui o Nixpacks a apenas salvar os arquivos e sair.
            var processInfo = new ProcessStartInfo
            {
                FileName = "nixpacks",
                Arguments = "build . --out .", // Gera o Dockerfile na raiz (.)
                WorkingDirectory = sourcePath, // Roda DENTRO da pasta
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = processInfo };

            // Logs para debug
            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[NIXPACKS-OUT] {e.Data}");
            };

            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data)) Console.WriteLine($"[NIXPACKS-ERR] {e.Data}");
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new Exception($"Nixpacks falhou com código de saída {process.ExitCode}. Veja os logs acima.");
            }

            // Verificação se o arquivo foi criado
            var dockerfilePath = Path.Combine(sourcePath, "Dockerfile");

            if (File.Exists(dockerfilePath))
            {
                Console.WriteLine($"[NIXPACKS] Sucesso! Dockerfile criado em: {dockerfilePath}");
            }
            else
            {
                throw new FileNotFoundException($"O Nixpacks rodou, mas nenhum 'Dockerfile' foi encontrado em {sourcePath}.");
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