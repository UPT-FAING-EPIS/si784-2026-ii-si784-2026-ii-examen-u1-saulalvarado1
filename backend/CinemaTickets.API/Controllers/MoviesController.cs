using Microsoft.AspNetCore.Mvc;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;

namespace CinemaTickets.API.Controllers;

[ApiController]
[Route("[controller]")]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MoviesController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    /// <summary>
    /// Listar películas en cartelera.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MovieResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MovieResponseDto>>> GetAll([FromQuery] bool activeOnly = true)
    {
        var movies = await _movieService.GetAllMoviesAsync(activeOnly);
        return Ok(movies);
    }

    /// <summary>
    /// Obtener detalle de película por ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MovieResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MovieResponseDto>> GetById(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);
        if (movie == null) return NotFound(new { message = $"Película con ID {id} no encontrada." });
        return Ok(movie);
    }

    /// <summary>
    /// Registrar nueva película.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MovieResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MovieResponseDto>> Create([FromBody] CreateMovieDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var movie = await _movieService.CreateMovieAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    /// <summary>
    /// Desactivar película.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _movieService.DeleteMovieAsync(id);
        if (!deleted) return NotFound(new { message = $"Película con ID {id} no encontrada." });
        return NoContent();
    }
}
