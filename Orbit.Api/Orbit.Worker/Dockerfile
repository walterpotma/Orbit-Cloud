FROM mcr.microsoft.com/dotnet/sdk:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["Orbit.Worker/Orbit.Worker.csproj", "Orbit.Worker/"]
COPY ["Orbit.Application/Orbit.Application.csproj", "Orbit.Application/"]
COPY ["Orbit.Domain/Orbit.Domain.csproj", "Orbit.Domain/"]
COPY ["Orbit.Infrastructure/Orbit.Infrastructure.csproj", "Orbit.Infrastructure/"]

RUN dotnet restore "Orbit.Worker/Orbit.Worker.csproj"

COPY . .

WORKDIR "/src/Orbit.Worker"
RUN dotnet build "Orbit.Worker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Orbit.Worker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

# Adicionamos docker.io para o C# conseguir disparar comandos docker
RUN apt-get update && apt-get install -y curl git docker.io && \
    curl -sLS https://nixpacks.com/install.sh | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

RUN mkdir -p /data/archive/clients && chmod -R 777 /data/archive

USER root

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Orbit.Worker.dll"]