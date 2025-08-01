# --- Estágio 1: Build ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copia os arquivos de projeto e restaura dependências
COPY Orbit.Api/Orbit.Api/Orbit.Api.csproj Orbit.Api/
RUN dotnet restore Orbit.Api/Orbit.Api.csproj

# Copia todo o código e publica
COPY Orbit.Api/Orbit.Api/. Orbit.Api/
WORKDIR /src/Orbit.Api
RUN dotnet publish -c Release -o /app/publish

# --- Estágio 2: Runtime ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 7000
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]
