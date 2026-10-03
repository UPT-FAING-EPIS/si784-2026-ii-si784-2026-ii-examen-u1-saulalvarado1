using Microsoft.AspNetCore.Mvc;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;

namespace CinemaTickets.API.Controllers;

[ApiController]
[Route("[controller]")]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly IShowtimeService _showtimeService;

    public ShowtimesController(IShowtimeService showtimeService)
    {
        _showtimeService = showtimeService;
    }

    /// <summary>
    /// Consultar funciones por fecha y hora, con filtros opcionales por película y sala.
    /// GET /showtimes?date={fecha}&amp;time={hora}
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ShowtimeResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ShowtimeResponseDto>>> GetShowtimes(
        [FromQuery] DateTime? date,
        [FromQuery] string? time,
        [FromQuery] int? movieId,
        [FromQuery] int? roomId)
    {
        var showtimes = await _showtimeService.GetShowtimesAsync(date, time, movieId, roomId);
        return Ok(showtimes);
    }

    /// <summary>
    /// Obtener detalle de una función por ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ShowtimeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShowtimeResponseDto>> GetById(int id)
    {
        var showtime = await _showtimeService.GetShowtimeByIdAsync(id);
        if (showtime == null) return NotFound(new { message = $"Función con ID {id} no encontrada." });
        return Ok(showtime);
    }

    /// <summary>
    /// Registrar función de película.
    /// POST /showtimes
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ShowtimeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ShowtimeResponseDto>> Create([FromBody] CreateShowtimeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _showtimeService.CreateShowtimeAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Ver disponibilidad de asientos para una función en tiempo real.
    /// GET /showtimes/{id}/seats
    /// </summary>
    [HttpGet("{id}/seats")]
    [ProducesResponseType(typeof(ShowtimeSeatsResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ShowtimeSeatsResponseDto>> GetSeats(int id)
    {
        var seats = await _showtimeService.GetShowtimeSeatsAsync(id);
        if (seats == null) return NotFound(new { message = $"Función con ID {id} no encontrada." });
        return Ok(seats);
    }
}
