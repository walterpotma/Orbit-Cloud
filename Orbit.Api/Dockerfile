# Caminho: ~/Projects/Orbit-CI-CD/Orbit.Api/Dockerfile

# --- Estágio 1: Compilação (Build) ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# CORREÇÃO: Usamos o caminho aninhado "Orbit.Api/Orbit.Api.csproj" para a origem.
COPY Orbit.Api/Orbit.Api.csproj Orbit.Api/
RUN dotnet restore Orbit.Api/Orbit.Api.csproj

# CORREÇÃO: Copiamos o resto do código da pasta aninhada.
COPY Orbit.Api/Orbit.Api/. Orbit.Api/

# Publica a aplicação.
RUN dotnet publish Orbit.Api/Orbit.Api.csproj -c Release -o /app/publish

# --- Estágio 2: Imagem Final (Final) ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]