using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Text;

namespace Orbit.Api.Helpers
{
    public static class ShellHelper
    {
        /// <summary>
        /// Executa um script ou comando no terminal do Linux (bash).
        /// </summary>
        public static async Task<(int ExitCode, string Output, string Error)> RunScriptAsync(string scriptPath, string args = "")
        {
            // Verifica se o arquivo existe antes de tentar rodar
            if (!File.Exists(scriptPath))
            {
                return (-1, string.Empty, $"Script não encontrado no caminho: {scriptPath}");
            }

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "/bin/bash", // Usamos o bash para rodar o .sh
                Arguments = $"-c \"{scriptPath} {args}\"", // -c executa o comando string
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = Path.GetDirectoryName(scriptPath) // Roda na pasta do script
            };

            using var process = new Process();
            process.StartInfo = processStartInfo;

            var outputBuilder = new StringBuilder();
            var errorBuilder = new StringBuilder();

            // Captura o que o script escreve na tela (logs)
            process.OutputDataReceived += (sender, e) => { if (e.Data != null) outputBuilder.AppendLine(e.Data); };
            process.ErrorDataReceived += (sender, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                // Espera o script terminar
                await process.WaitForExitAsync();

                return (process.ExitCode, outputBuilder.ToString(), errorBuilder.ToString());
            }
            catch (Exception ex)
            {
                return (-1, string.Empty, $"Erro crítico ao tentar rodar script: {ex.Message}");
            }
        }

        /// <summary>
        /// Dá permissão de execução (chmod +x) para um arquivo.
        /// Necessário porque arquivos criados ou copiados no Linux nem sempre são executáveis.
        /// </summary>
        public static async Task MakeExecutableAsync(string filePath)
        {
            if (!File.Exists(filePath)) return;

            var psi = new ProcessStartInfo
            {
                FileName = "chmod",
                Arguments = $"+x {filePath}",
                RedirectStandardOutput = false,
                RedirectStandardError = false,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var p = Process.Start(psi);
            if (p != null)
            {
                await p.WaitForExitAsync();
            }
        }
    }
}