using k8s;
using Microsoft.EntityFrameworkCore;
using Orbit.Infrastructure.Data;

var builder = Host.CreateApplicationBuilder(args);

#region Kubernetes Admin
Console.WriteLine("🪐 Orbit.Worker: Iniciando em modo In-Cluster");

var kubernetesConfig = KubernetesClientConfiguration.InClusterConfig();

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));

#endregion

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var rabbitHost = builder.Configuration["Kubernetes:RabbitMQ:Host"];

Console.WriteLine($"🐇 Tentando estabelecer conexão com RabbitMQ em: {rabbitHost}...");

try 
{
    var factory = new ConnectionFactory { HostName = rabbitHost };
    
    using var connection = factory.CreateConnection();
    using var channel = connection.CreateModel();
    
    Console.WriteLine("✅ Conexão com RabbitMQ estabelecida com sucesso!");
}
catch (Exception ex)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("❌ ERRO FATAL: Não foi possível conectar ao RabbitMQ.");
    Console.WriteLine($"Motive: {ex.Message}");
    Console.ResetColor();
    
    Environment.Exit(1); 
}

builder.Services.AddDbContext<OrbitContext>(options => options.UseNpgsql(connectionString));

var host = builder.Build();

Console.WriteLine("🚀 Orbit.Worker em órbita e pronto para processar!");

await host.RunAsync();