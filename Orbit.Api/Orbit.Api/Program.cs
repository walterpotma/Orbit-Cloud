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

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<OrbitDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<DeployService>();
builder.Services.AddScoped<IDeployRepository, DeployRepository>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();


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

    options.CallbackPath = new PathString("/weatherforecast");

    options.AuthorizationEndpoint = "https://github.com/login/oauth/authorize";
    options.TokenEndpoint = "https://github.com/login/oauth/access_token";
    options.UserInformationEndpoint = "https://api.github.com/user";

    options.Scope.Add("user:email");

    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");


    options.SaveTokens = true;

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            Console.WriteLine("----------- TOKEN DE ACESSO DO GITHUB -----------");
            Console.WriteLine(context.AccessToken);
            Console.WriteLine("-----------------------------------------------");

            using var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", context.AccessToken);

            var response = await context.Backchannel.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();

            Console.WriteLine("----------- RESPOSTA DO GITHUB -----------");
            Console.WriteLine(jsonResponse);
            Console.WriteLine("------------------------------------------");

            using var user = System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            context.RunClaimActions(user.RootElement);

            var githubId = user.RootElement.GetProperty("id").GetInt64().ToString();
            var name = user.RootElement.GetProperty("name").GetString();

            var email = user.RootElement.TryGetProperty("email", out var emailProp) && emailProp.ValueKind != System.Text.Json.JsonValueKind.Null ? emailProp.GetString() : null;

            var accountService = context.HttpContext.RequestServices.GetRequiredService<AccountService>();

            await accountService.GetByGitIdOrCreate(githubId, name ?? "Usuário Sem Nome", email);
        },

        OnTicketReceived = context =>
        {
            context.Response.Redirect("https://orbit.crion.dev");
            context.HandleResponse();
            return Task.CompletedTask;
        }
    };
});


builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/", () => {
    return Results.File("index.html", "text/html");
});
app.MapGet("/login", () => Results.Challenge(new AuthenticationProperties { RedirectUri = "https://orbit.crion.dev" }, new[] { "GitHub" }));

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseStaticFiles();

app.Run();