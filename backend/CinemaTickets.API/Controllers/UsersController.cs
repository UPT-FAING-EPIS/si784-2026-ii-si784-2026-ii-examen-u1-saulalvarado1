using Microsoft.AspNetCore.Mvc;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;

namespace CinemaTickets.API.Controllers;

[ApiController]
[Route("[controller]")]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ITicketService _ticketService;

    public UsersController(IUserService userService, ITicketService ticketService)
    {
        _userService = userService;
        _ticketService = ticketService;
    }

    /// <summary>
    /// Listar usuarios registrados.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Obtener usuario por ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound(new { message = $"Usuario {id} no encontrado." });
        return Ok(user);
    }

    /// <summary>
    /// Buscar usuario por correo electrónico.
    /// </summary>
    [HttpGet("by-email")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> GetByEmail([FromQuery] string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);
        if (user == null) return NotFound(new { message = $"Usuario con email {email} no encontrado." });
        return Ok(user);
    }

    /// <summary>
    /// Registrar o actualizar usuario.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserResponseDto>> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateUserAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /// <summary>
    /// Ver boletos comprados por un usuario específico.
    /// GET /users/{id}/tickets
    /// </summary>
    [HttpGet("{id}/tickets")]
    [ProducesResponseType(typeof(IEnumerable<TicketResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TicketResponseDto>>> GetUserTickets(int id)
    {
        var tickets = await _ticketService.GetUserTicketsAsync(id);
        return Ok(tickets);
    }
}
