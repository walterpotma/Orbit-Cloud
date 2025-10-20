using k8s;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service;
using Orbit.Api.Service.Interface;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

var kubeConfigPath = "keys/kube/hayom.yaml";
var kubernetesConfig = KubernetesClientConfiguration.BuildConfigFromConfigFile(kubeConfigPath);

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(7000);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

var connectionString = builder.Configuration.GetConnectionString("DatabaseConnection");

builder.Services.AddDbContext<OrbitDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<DeployService>();
builder.Services.AddScoped<IDeployRepository, DeployRepository>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<OrganizationService>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<PlanService>();
builder.Services.AddScoped<IPlanRepository, PlanRepository>();
builder.Services.AddScoped<RuleService>();
builder.Services.AddScoped<IRuleRepository, RuleRepository>();
builder.Services.AddScoped<SubscriptionService>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<TransacionService>();
builder.Services.AddScoped<ITransacionRepository, TransacionRepository>();
builder.Services.AddScoped<GithubService>();
builder.Services.AddScoped<IGithubRepository, GithubRepository>();

// Novo modelo de arquitetura da api
builder.Services.AddScoped<IKubernetesRepository, KubernetesRepository>();
builder.Services.AddScoped<IKubernetesService, KubernetesService>();


builder.Services.AddAuthentication(options =>
{
options.DefaultScheme = "Cookies";
options.DefaultChallengeScheme = "GitHub";
})
.AddCookie("Cookies")
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

            request.Headers.UserAgent.Add(new System.Net.Http.Headers.ProductInfoHeaderValue("DotNet-App-Login", "1.0"));

            var response = await context.Backchannel.SendAsync(request,
                HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);

            response.EnsureSuccessStatusCode();

            var user = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            context.RunClaimActions(user.RootElement);
        }
    };
});


builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();


app.UseCors("CorsPolicy");

app.MapGet("/", () => {
    return Results.File("index.html", "text/html");
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles();

app.Run();