using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using Orbit.Api.Data;
using Orbit.Api.Repository;
using Orbit.Api.Repository.Interface;
using Orbit.Api.Service;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(7000);
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


builder.Services.AddAuthentication(options =>
{
options.DefaultScheme = "Cookies"; // Usado para gerenciar o estado da autenticação
options.DefaultChallengeScheme = "GitHub";
})
.AddCookie("Cookies") // O cookie é necessário para o fluxo funcionar
.AddOAuth("GitHub", options =>
{
    options.ClientId = builder.Configuration["Authentication:GitHub:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:GitHub:ClientSecret"];

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    options.CallbackPath = "/signin-github";

    // Estas linhas são importantes! Elas mapeiam o JSON do GitHub para Claims
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
            // Cria uma nova requisição para o UserInformationEndpoint
            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);

            // ##################################################
            // ##        A SOLUÇÃO FINAL ESTÁ AQUI             ##
            // ## Adicionando o header User-Agent obrigatório  ##
            // ##################################################
            request.Headers.UserAgent.Add(new System.Net.Http.Headers.ProductInfoHeaderValue("DotNet-App-Login", "1.0"));

            // Envia a requisição usando o HttpClient seguro do handler
            var response = await context.Backchannel.SendAsync(request,
                HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);

            response.EnsureSuccessStatusCode();

            // Lê a resposta JSON e usa as ClaimActions para popular o usuário
            var user = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            context.RunClaimActions(user.RootElement);
        }
    };
});


builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/", () => {
    return Results.File("index.html", "text/html");
});
//app.MapGet("/login", () => Results.Challenge(new AuthenticationProperties { RedirectUri = "https://orbit.crion.dev" }, new[] { "GitHub" }));

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