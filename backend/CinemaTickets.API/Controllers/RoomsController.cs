using Microsoft.AspNetCore.Mvc;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;

namespace CinemaTickets.API.Controllers;

[ApiController]
[Route("[controller]")]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    /// <summary>
    /// Listar salas de cine disponibles.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoomDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAll()
    {
        var rooms = await _roomService.GetAllRoomsAsync();
        return Ok(rooms);
    }

    /// <summary>
    /// Obtener detalle de una sala.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(RoomDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoomDto>> GetById(int id)
    {
        var room = await _roomService.GetRoomByIdAsync(id);
        if (room == null) return NotFound(new { message = $"Sala {id} no encontrada." });
        return Ok(room);
    }

    /// <summary>
    /// Registrar una nueva sala con cuadrícula de asientos automática.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(RoomDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<RoomDto>> Create([FromBody] CreateRoomDto dto)
    {
        var room = await _roomService.CreateRoomAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }
}
