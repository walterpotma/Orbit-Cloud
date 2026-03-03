using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Text;

namespace Orbit.Application.Helpers
{
    public static class ShellHelper
    {
        public static async Task<(int ExitCode, string Output, string Error)> RunScriptAsync(string scriptPath, string args = "")
        {
            if (!File.Exists(scriptPath))
            {
                return (-1, string.Empty, $"Script não encontrado no caminho: {scriptPath}");
            }

            var processStartInfo = new ProcessStartInfo
            {
                FileName = "/bin/bash",
                Arguments = $"-c \"{scriptPath} {args}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = Path.GetDirectoryName(scriptPath)
            };

            using var process = new Process();
            process.StartInfo = processStartInfo;

            var outputBuilder = new StringBuilder();
            var errorBuilder = new StringBuilder();

            process.OutputDataReceived += (sender, e) => { if (e.Data != null) outputBuilder.AppendLine(e.Data); };
            process.ErrorDataReceived += (sender, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

            try
            {
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                await process.WaitForExitAsync();

                return (process.ExitCode, outputBuilder.ToString(), errorBuilder.ToString());
            }
            catch (Exception ex)
            {
                return (-1, string.Empty, $"Erro crítico ao tentar rodar script: {ex.Message}");
            }
        }
        
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