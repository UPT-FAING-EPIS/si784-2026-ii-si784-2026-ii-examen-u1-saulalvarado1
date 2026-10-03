# ===================================================
# Stage 1: Build & Publish
# ===================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy project file and restore dependencies with layer caching
COPY ["CinemaTickets.API.csproj", "./"]
RUN dotnet restore "./CinemaTickets.API.csproj"

# Copy source code and build in Release mode
COPY . .
RUN dotnet publish "./CinemaTickets.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ===================================================
# Stage 2: Runtime (Minimal & Hardened Alpine)
# ===================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app

# Ensure security updates and non-root execution
RUN apk --no-cache upgrade && \
    addgroup -g 10001 -S cinemaapp && \
    adduser -u 10001 -S cinemaapp -G cinemaapp

# Copy compiled binaries from build stage
COPY --from=build --chown=cinemaapp:cinemaapp /app/publish .

# Run as non-privileged user (Crucial for Snyk & Semgrep zero-vulnerabilities)
USER 10001:10001

# Expose HTTP port
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "CinemaTickets.API.dll"]
