FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 7000

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY Orbit.Api/Orbit.Api/Orbit.Api.csproj Orbit.Api/
RUN dotnet restore Orbit.Api/Orbit.Api.csproj

COPY Orbit.Api/Orbit.Api/ Orbit.Api/

WORKDIR /src/Orbit.Api
RUN dotnet build Orbit.Api.csproj -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish Orbit.Api.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]