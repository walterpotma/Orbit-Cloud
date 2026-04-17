using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using Orbit.Infrastructure.Data; 
using k8s;

var builder = Host.CreateApplicationBuilder(args);
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// 1. Pegando as configurações do JSON corretamente
var rabbitSection = builder.Configuration.GetSection("Kubernetes:RabbitMQ");

// 2. Configurando a Factory com TODAS as informações do seu print
var factory = new ConnectionFactory 
{ 
    HostName = rabbitSection["HostName"] ?? "rabbitmq",
    Port = int.Parse(rabbitSection["Port"] ?? "5672"),
    UserName = rabbitSection["UserName"] ?? "guest",
    Password = rabbitSection["Password"] ?? "guest"
};

try 
{
    Console.WriteLine($"🐇 Tentando conectar ao RabbitMQ em: {factory.HostName}...");
    using var connection = await factory.CreateConnectionAsync();
    Console.WriteLine($"🔍 DEBUG: Conectando com Host: '{factory.HostName}', User: '{factory.UserName}'");
    Console.WriteLine("✅ Conexão com RabbitMQ estabelecida com sucesso!");
}
catch (Exception ex)
{
    Console.WriteLine($"🔍 DEBUG: Conectando com Host: '{factory.HostName}', User: '{factory.UserName}'");
    Console.WriteLine($"❌ Erro ao conectar no RabbitMQ: {ex.Message}");
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<OrbitContext>(options =>
    options.UseNpgsql(connectionString)
);

// builder.Services.AddHostedService<Orbit.Worker.Queue.DockerQueue>();

var host = builder.Build();
await host.RunAsync();