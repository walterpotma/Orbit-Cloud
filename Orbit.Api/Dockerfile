FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Orbit.Api/Orbit.Api/Orbit.Api.csproj Orbit.Api/
RUN dotnet restore Orbit.Api/Orbit.Api/Orbit.Api.csproj
COPY Orbit.Api/. Orbit.Api/

RUN dotnet publish Orbit.Api/Orbit.Api.csproj -c Release -o /app/publish

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Orbit.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 7000
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]