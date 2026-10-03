using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Services;

public interface IMovieService
{
    Task<IEnumerable<MovieResponseDto>> GetAllMoviesAsync(bool activeOnly = true);
    Task<MovieResponseDto?> GetMovieByIdAsync(int id);
    Task<MovieResponseDto> CreateMovieAsync(CreateMovieDto dto);
    Task<bool> DeleteMovieAsync(int id);
}

public class MovieService : IMovieService
{
    private readonly CinemaDbContext _context;

    public MovieService(CinemaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MovieResponseDto>> GetAllMoviesAsync(bool activeOnly = true)
    {
        var query = _context.Movies.AsNoTracking();
        if (activeOnly)
        {
            query = query.Where(m => m.IsActive);
        }

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MovieResponseDto(
                m.Id,
                m.Title,
                m.Synopsis,
                m.Genre,
                m.DurationMinutes,
                m.PosterUrl,
                m.Rating,
                m.IsActive
            ))
            .ToListAsync();
    }

    public async Task<MovieResponseDto?> GetMovieByIdAsync(int id)
    {
        var movie = await _context.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null) return null;

        return new MovieResponseDto(
            movie.Id,
            movie.Title,
            movie.Synopsis,
            movie.Genre,
            movie.DurationMinutes,
            movie.PosterUrl,
            movie.Rating,
            movie.IsActive
        );
    }

    public async Task<MovieResponseDto> CreateMovieAsync(CreateMovieDto dto)
    {
        var movie = new Movie
        {
            Title = dto.Title.Trim(),
            Synopsis = dto.Synopsis.Trim(),
            Genre = dto.Genre.Trim(),
            DurationMinutes = dto.DurationMinutes,
            PosterUrl = dto.PosterUrl.Trim(),
            Rating = dto.Rating.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return new MovieResponseDto(
            movie.Id,
            movie.Title,
            movie.Synopsis,
            movie.Genre,
            movie.DurationMinutes,
            movie.PosterUrl,
            movie.Rating,
            movie.IsActive
        );
    }

    public async Task<bool> DeleteMovieAsync(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return false;

        movie.IsActive = false; // Soft delete
        await _context.SaveChangesAsync();
        return true;
    }
}
