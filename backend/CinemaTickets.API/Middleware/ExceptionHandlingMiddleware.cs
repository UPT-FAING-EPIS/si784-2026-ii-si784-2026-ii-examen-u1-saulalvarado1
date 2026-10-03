using System.Net;
using System.Text.Json;

namespace CinemaTickets.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ocurrió una excepción no controlada: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title, detail) = exception switch
        {
            KeyNotFoundException knf => (HttpStatusCode.NotFound, "Recurso no encontrado", knf.Message),
            ArgumentException arg => (HttpStatusCode.BadRequest, "Solicitud inválida", arg.Message),
            InvalidOperationException inv => (HttpStatusCode.Conflict, "Conflicto en la operación", inv.Message),
            _ => (HttpStatusCode.InternalServerError, "Error interno del servidor", "Ha ocurrido un error inesperado. Por favor intente más tarde.")
        };

        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new
        {
            type = $"https://httpstatuses.com/{(int)statusCode}",
            title,
            status = (int)statusCode,
            detail,
            instance = context.Request.Path.Value,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(problemDetails, JsonOptions);

        return context.Response.WriteAsync(json, context.RequestAborted);
    }
}
