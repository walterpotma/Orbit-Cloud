# Acesse https://aka.ms/customizecontainer para saber como personalizar seu contêiner de depuração e como o Visual Studio usa este Dockerfile para criar suas imagens para uma depuração mais rápida.

# Esta fase é usada durante a execução no VS no modo rápido (Padrão para a configuração de Depuração)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Orbit.Api/Orbit.Api.csproj Orbit.Api/
RUN dotnet restore Orbit.Api/Orbit.Api.csproj

RUN dotnet publish Orbit.Api/Orbit.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 7000

ENTRYPOINT ["dotnet", "Orbit.Api.dll"]
