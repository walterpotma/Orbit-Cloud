using k8s;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OAuth;
using System.Security.Claims;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.HttpOverrides;
using System.Security.Claims;
using Orbit.Application.Interfaces;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Repository;
using Orbit.Infrastructure.Services;
using Orbit.Application.Mappers;

var builder = WebApplication.CreateBuilder(args);

#region Kubernetes Admin
KubernetesClientConfiguration kubernetesConfig;

Console.WriteLine("🚀 Iniciando em modo In-Cluster (Kubernetes)");
kubernetesConfig = KubernetesClientConfiguration.InClusterConfig();

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));
#endregion

#region Cors Conffig
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
#endregion

#region Github Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies";
    options.DefaultSignInScheme = "Cookies";
    options.DefaultChallengeScheme = "GitHub";
})
.AddCookie("Cookies", options =>
{
    options.Cookie.Name = "orbit_session";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.Cookie.Domain = "orbitcloud.com.br";

    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.Events.OnRedirectToLogin = context =>
    {
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
    options.CallbackPath = "api/signin-github";

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
    options.ClaimActions.MapJsonKey("urn:github:login", "login");
    options.ClaimActions.MapJsonKey("urn:github:avatar", "avatar_url");

    //CAMPO DE PERMISSÕES 
    options.Scope.Add("read:user");
    options.Scope.Add("user:email");
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

#region Github App
builder.Services.AddHttpContextAccessor();

// builder.Services.Configure<GithubAppSettings>(builder.Configuration.GetSection("GithubApp"));

builder.Services.AddScoped<MapperGithub>();
builder.Services.AddScoped<IGithubRepository, GithubRepository>();
builder.Services.AddScoped<IGithubService, GithubService>();
#endregion

#region Account
builder.Services.AddScoped<IAccountService, AccountService>();
#endregion

#region Prometheus
builder.Services.AddScoped<IPrometheusService, PrometheusService>();
#endregion

#region Kubernetes
builder.Services.AddScoped<IKubernetesRepository, KubernetesRepository>();
builder.Services.AddScoped<IKubernetesService, KubernetesService>();
builder.Services.AddSingleton<MapperKubernetes>();
#endregion

#region FileSystem
builder.Services.AddScoped<IFileSystemRepository, FileSystemRepository>();
builder.Services.AddScoped<IFileSystemService, FileSystemService>();
#endregion

#region Docker
builder.Services.AddScoped<IRegistryRepository, RegistryRepository>();
builder.Services.AddScoped<IRegistryService, RegistryService>();

builder.Services.AddScoped<IDockerService, DockerService>();
#endregion

builder.Services.AddControllers();

builder.Services.AddOpenApi();

builder.Services.AddHttpClient();

builder.Services.AddAuthorization();

builder.Services.AddControllers();

var app = builder.Build();

app.UseStaticFiles();

app.UseStatusCodePagesWithReExecute("/feedback/{0}");

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors("CorsPolicy");

app.MapGet("/", () =>
{
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

public class GithubAppSettings {
    public string AppId { get; set; } = string.Empty;
    public string PrivateKeyPath { get; set; } = string.Empty;
}