# Estágio Base (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

RUN apt-get update && \
    apt-get install -y curl git bash docker.io && \
    rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Orbit.Api/Orbit.Api.csproj", "Orbit.Api/"]
COPY ["Orbit.Application/Orbit.Application.csproj", "Orbit.Application/"]
COPY ["Orbit.Domain/Orbit.Domain.csproj", "Orbit.Domain/"]
COPY ["Orbit.Infrastructure/Orbit.Infrastructure.csproj", "Orbit.Infrastructure/"]

RUN dotnet restore "Orbit.Api/Orbit.Api.csproj"

COPY . .

WORKDIR "/src/Orbit.Api"
RUN dotnet build "Orbit.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Orbit.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]