using k8s;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Orbit.Application.Interfaces;
using Orbit.Application.Interfaces.Services;
using Orbit.Application.Mappers;
using Orbit.Application.Services;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Repositories;
using Orbit.Infrastructure.Services;
using System.Runtime.InteropServices;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

#region Kubernetes Admin
KubernetesClientConfiguration kubernetesConfig;

Console.WriteLine("🚀 Iniciando em modo In-Cluster (Kubernetes)");
kubernetesConfig = KubernetesClientConfiguration.InClusterConfig();

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));
#endregion

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("https://orbitcloud.com.br")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// builder.Services.AddSingleton<Docker.DotNet.IDockerClient>(sp =>
// {
//     Uri dockerUri;
    
//     if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
//     {
//         dockerUri = new Uri("npipe://./pipe/docker_engine");
//     }
//     else
//     {
//         dockerUri = new Uri("unix:///var/run/docker.sock");
//     }
    
//     return new Docker.DotNet.DockerClientConfiguration(dockerUri).CreateClient();
// });

builder.Services.AddScoped<IAccountService, AccountService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<IPrometheusService, PrometheusService>();

builder.Services.AddScoped<IGithubService, GithubService>();
builder.Services.AddScoped<IGithubRepository, GithubRepository>();

builder.Services.AddScoped<IKubernetesRepository, KubernetesRepository>();
builder.Services.AddScoped<IKubernetesService, KubernetesService>();
builder.Services.AddSingleton<MapperKubernetes>();

builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();

builder.Services.AddScoped<IRegistryRepository, RegistryRepository>();
builder.Services.AddScoped<IRegistryService, RegistryService>();


builder.Services.AddScoped<IDockerService, DockerService>();

#region Authentication Github
builder.Services.AddAuthentication(options =>
{
    // O padrão é Cookie (pois é o navegador que acessa)
    options.DefaultScheme = "Cookies";
    options.DefaultSignInScheme = "Cookies";
    options.DefaultChallengeScheme = "GitHub"; // Se não tiver logado, manda pro GitHub
})
.AddCookie("Cookies", options =>
{
    options.Cookie.Name = "orbit_session";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.Domain = ".orbitcloud.com.br"; // Permite subdomínios

    // Configurações de segurança para HTTPS
    options.Cookie.SameSite = SameSiteMode.Lax; // Ou None se o front for outro dominio
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.Events.OnRedirectToLogin = context =>
    {
        // Se a API (axios) chamar e não tiver logado, dá 401 em vez de tentar redirecionar HTML
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        }
        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
})
.AddOAuth("GitHub", options =>
{
    options.ClientId = builder.Configuration["Authentication:GitHub:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:GitHub:ClientSecret"];
    options.CallbackPath = "/signin-github";

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    // Mapeamento dos dados do JSON do GitHub para o User da API
    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
    options.ClaimActions.MapJsonKey("urn:github:login", "login");
    options.ClaimActions.MapJsonKey("urn:github:avatar", "avatar_url");

    options.Scope.Add("read:user");
    options.Scope.Add("user:email");

    // ESTA É A LINHA QUE TRAZ OS PRIVADOS:
    options.Scope.Add("repo");

    options.SaveTokens = true;

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);

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