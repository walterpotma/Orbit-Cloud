using k8s;

var builder = WebApplication.CreateBuilder(args);

#region Kubernetes Admin
KubernetesClientConfiguration kubernetesConfig;

Console.WriteLine("🚀 Iniciando em modo In-Cluster (Kubernetes)");
kubernetesConfig = KubernetesClientConfiguration.InClusterConfig();

builder.Services.AddSingleton<IKubernetes>(new Kubernetes(kubernetesConfig));
#endregion

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