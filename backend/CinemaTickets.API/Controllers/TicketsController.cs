using Microsoft.AspNetCore.Mvc;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;

namespace CinemaTickets.API.Controllers;

[ApiController]
[Route("[controller]")]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    /// <summary>
    /// Reservar asientos temporalmente (bloqueo por 5 minutos).
    /// POST /tickets/reservations
    /// </summary>
    [HttpPost("reservations")]
    [ProducesResponseType(typeof(ReservationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ReservationResponseDto>> ReserveSeats([FromBody] ReserveSeatsDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var reservation = await _ticketService.ReserveSeatsAsync(dto);
            return Ok(reservation);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Confirmar compra de boletos.
    /// POST /tickets/purchase
    /// </summary>
    [HttpPost("purchase")]
    [ProducesResponseType(typeof(PurchaseConfirmationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PurchaseConfirmationDto>> PurchaseTickets([FromBody] PurchaseTicketsDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var confirmation = await _ticketService.PurchaseTicketsAsync(dto);
            return Ok(confirmation);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
