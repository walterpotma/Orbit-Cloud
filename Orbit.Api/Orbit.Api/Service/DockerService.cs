using Microsoft.Extensions.Configuration; // <--- Importante
using Orbit.Api.Helpers;
using System;
using System.Threading.Tasks;

namespace Orbit.Api.Service
{
    public class DockerService
    {
        // 1. Variável para guardar a configuração
        private readonly IConfiguration _configuration;

        // 2. Injeção de Dependência no Construtor
        public DockerService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task GenerateDockerfile(string githubId, string appName)
        {
            // 3. A forma correta de ler do appsettings.json
            var scriptPath = _configuration["FileExplorer:NixPack"];

            // Segurança: Verifica se achou o valor
            if (string.IsNullOrEmpty(scriptPath))
            {
                throw new Exception("ERRO: A configuração 'FileExplorer:ScriptPath' não foi encontrada no appsettings.json.");
            }

            // Primeiro: Garante permissão de execução
            await ShellHelper.MakeExecutableAsync(scriptPath);

            // Segundo: Prepara os argumentos ($1 $2)
            var args = $"{githubId} {appName}";

            Console.WriteLine($"[API] Chamando gerador de Dockerfile para {appName} em {scriptPath}...");

            // Terceiro: Executa
            var result = await ShellHelper.RunScriptAsync(scriptPath, args);

            if (result.ExitCode == 0)
            {
                Console.WriteLine("[API] Dockerfile criado com sucesso!");
            }
            else
            {
                Console.WriteLine($"[API] Erro ao gerar: {result.Error}");
                throw new Exception($"Falha na geração do Dockerfile: {result.Error}");
            }
        }

        public async Task GenerateImage(string githubId, string appName, string version, string appPath)
        {
            var scriptPath = _configuration["FileExplorer:BuildPack"];

            if (string.IsNullOrEmpty(scriptPath))
            {
                throw new Exception("ERRO: A configuração 'FileExplorer:ScriptPath' não foi encontrada no appsettings.json.");
            }

            // Primeiro: Garante permissão de execução
            await ShellHelper.MakeExecutableAsync(scriptPath);

            // Segundo: Prepara os argumentos ($1 $2)
            var args = $"{githubId} {appName}";

            Console.WriteLine($"[API] construindo image para {appName} em {scriptPath}...");

            // Terceiro: Executa
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