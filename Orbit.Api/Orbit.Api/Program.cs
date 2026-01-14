using k8s;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Mappers;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service;
using Orbit.Api.Service.Interface;
using System.Security.Claims;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

KubernetesClientConfiguration kubernetesConfig;

if (KubernetesClientConfiguration.IsInCluster())
{
    Console.WriteLine("🚀 Iniciando em modo In-Cluster (Kubernetes)");
    kubernetesConfig = KubernetesClientConfiguration.InClusterConfig();
}
else
{
    Console.WriteLine("💻 Iniciando em modo Local (Dev)");
    var kubeConfigPath = "keys/kube/hayom.yaml";
    
    if (File.Exists(kubeConfigPath))
    {
        kubernetesConfig = KubernetesClientConfiguration.BuildConfigFromConfigFile(kubeConfigPath);
    }
    else
    {
        Console.WriteLine($"⚠️ Arquivo {kubeConfigPath} não encontrado. Tentando config padrão.");
        kubernetesConfig = KubernetesClientConfiguration.BuildConfigFromConfigFile(); 
    }
}

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://app.orbitcloud.com.br", "https://orbitcloud.com.br", "https://admin.orbitcloud.com.br")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<Docker.DotNet.IDockerClient>(sp =>
{
    Uri dockerUri;
    
    if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
    {
        // Se você estiver rodando no Visual Studio no Windows
        dockerUri = new Uri("npipe://./pipe/docker_engine");
    }
    else
    {
        // Se estiver rodando no K3s (Linux)
        // Isso vai conectar no arquivo /var/run/docker.sock que montamos no deployment
        dockerUri = new Uri("unix:///var/run/docker.sock");
    }
    
    return new Docker.DotNet.DockerClientConfiguration(dockerUri).CreateClient();
});

var connectionString = builder.Configuration.GetConnectionString("DatabaseConnection");

builder.Services.AddDbContext<OrbitDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<OrganizationService>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<PlanService>();
builder.Services.AddScoped<IPlanRepository, PlanRepository>();
builder.Services.AddScoped<RuleService>();
builder.Services.AddScoped<IRuleRepository, RuleRepository>();

// Novo modelo de arquitetura da api

#region Github Scoped
builder.Services.AddScoped<IGithubService, GithubService>();
builder.Services.AddScoped<IGithubRepository, GithubRepository>();
#endregion

#region Kubernetes Scoped
builder.Services.AddScoped<IKubernetesRepository, KubernetesRepository>();
builder.Services.AddScoped<IKubernetesService, KubernetesService>();
builder.Services.AddSingleton<MapperKubernetes>();
#endregion

builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();

builder.Services.AddScoped<IRegistryRepository, RegistryRepository>();
builder.Services.AddScoped<IRegistryService, RegistryService>();

#region Authentication Github
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies";
    options.DefaultChallengeScheme = "GitHub";
})
.AddCookie("Cookies", options =>
{
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.Domain = ".orbitcloud.com.br";
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
})
.AddOAuth("GitHub", options =>
{
    options.ClientId = builder.Configuration["Authentication:GitHub:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:GitHub:ClientSecret"];

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    options.CallbackPath = "/signin-github";

    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
    options.ClaimActions.MapJsonKey("urn:github:login", "login");
    options.ClaimActions.MapJsonKey("urn:github:avatar", "avatar_url");
    options.ClaimActions.MapJsonKey("urn:github:url", "html_url");

    options.Scope.Add("read:user");
    options.Scope.Add("user:email");

    options.SaveTokens = true;

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);
            request.Headers.UserAgent.Add(new System.Net.Http.Headers.ProductInfoHeaderValue("Orbit-Cloud", "1.0"));

            var response = await context.Backchannel.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
            response.EnsureSuccessStatusCode();

            var user = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            context.RunClaimActions(user.RootElement);
        }
    };
});
#endregion

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors("CorsPolicy");

app.MapGet("/", () => {
    return Results.File("index.html", "text/html");
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

app.Use((context, next) =>
{
    context.Request.Scheme = "https";
    return next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles();

app.Run();