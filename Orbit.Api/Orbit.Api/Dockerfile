FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# --- CORREÇÃO AQUI ---
# Como estamos buildando de dentro da pasta do projeto, 
# copiamos o arquivo direto, sem caminhos longos.
COPY ["Orbit.Api.csproj", "."]
RUN dotnet restore "./Orbit.Api.csproj"

COPY . .
WORKDIR "/src/."
RUN dotnet build "./Orbit.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Orbit.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Mantendo nossa instalação do Git/Curl e garantindo o Bash
RUN apt-get update && \
    apt-get install -y curl git bash && \
    rm -rf /var/lib/apt/lists/*

VOLUME /app/FileSystem
# Removemos o VOLUME do nixpacks pois ele será montado pelo Kubernetes, não precisa declarar aqui

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]
