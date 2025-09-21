# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the solution file and project file for dependency restore
COPY Orbit.Api.sln .
COPY Orbit.Api/Orbit.Api.csproj Orbit.Api/

# Restore dependencies
RUN dotnet restore "Orbit.Api/Orbit.Api.csproj"

# Copy the rest of the application source code
COPY Orbit.Api/. Orbit.Api/

# Publish the application for release
WORKDIR /src/Orbit.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Create the final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Configure ASP.NET Core to listen on port 8080
ENV ASPNETCORE_URLS=http://+:8080

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Expose port 8080
EXPOSE 8080

# Define the entrypoint to run the application
ENTRYPOINT ["dotnet", "Orbit.Api.dll"]