using System.Reflection;
using CinemaTickets.API.Data;
using CinemaTickets.API.Middleware;
using CinemaTickets.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger OpenAPI documentation
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CinePass API - Sistema de Venta de Boletos para Cine",
        Version = "v1",
        Description = "API RESTful para consulta de cartelera semanal, reserva temporal de asientos y compra de boletos de cine.",
        Contact = new OpenApiContact
        {
            Name = "Grupo 5 - UPT FAING EPIS",
            Url = new Uri("https://github.com/UPT-FAING-EPIS/si784-2026-ii-si784-2026-ii-proyecto-group-5")
        }
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Configure Database (PostgreSQL if connection string or env variable is provided, otherwise SQLite)
var postgresConnection = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("PostgresConnection");

var sqliteConnection = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=cinema_tickets.db";

if (!string.IsNullOrWhiteSpace(postgresConnection))
{
    builder.Services.AddDbContext<CinemaDbContext>(options =>
        options.UseNpgsql(postgresConnection));
}
else
{
    builder.Services.AddDbContext<CinemaDbContext>(options =>
        options.UseSqlite(sqliteConnection));
}

// Register Application Services (Clean Architecture: Services layer)
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<IShowtimeService, ShowtimeService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IUserService, UserService>();

// Configure CORS
const string CorsPolicy = "CinemaCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Configurable for development and cloud hosting
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Global Exception Handler Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Initialize and Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CinemaDbContext>();
        await DbInitializer.InitializeAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al inicializar la base de datos de CinePass.");
    }
}

// Enable Swagger in development and containerized demo environments
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CinePass API v1");
    c.RoutePrefix = "swagger";
});

// Security Headers (Sonar security recommendations)
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseCors(CorsPolicy);

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "CinemaTickets.API", timestamp = DateTime.UtcNow }));

app.MapControllers();

app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
