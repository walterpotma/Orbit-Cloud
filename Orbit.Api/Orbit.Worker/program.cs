using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration; // IMPORTANTE
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;       // IMPORTANTE
using RabbitMQ.Client;
using Orbit.Infrastructure.Data; 
using k8s;

var builder = Host.CreateApplicationBuilder(args);

// Resolve o erro do GetConnectionString
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Resolve o erro do RabbitMQ (Ajustado para v6.x ou v7.x conforme seu uso)
// Se estiver usando v7.x, lembre-se de usar await e tornar o fluxo async
var factory = new ConnectionFactory { HostName = builder.Configuration["Kubernetes:RabbitMQ:HostName"] ?? "localhost" };

using var connection = await factory.CreateConnectionAsync();

// Resolve o erro do UseNpgsql
builder.Services.AddDbContext<OrbitContext>(options =>
    options.UseNpgsql(connectionString)
);

// builder.Services.AddHostedService<Orbit.Worker.Queue.DockerQueue>();

var host = builder.Build();
await host.RunAsync();