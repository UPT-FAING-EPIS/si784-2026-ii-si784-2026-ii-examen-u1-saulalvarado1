using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Services;

public interface IShowtimeService
{
    Task<IEnumerable<ShowtimeResponseDto>> GetShowtimesAsync(DateTime? date, string? time, int? movieId, int? roomId);
    Task<ShowtimeResponseDto?> GetShowtimeByIdAsync(int id);
    Task<ShowtimeResponseDto> CreateShowtimeAsync(CreateShowtimeDto dto);
    Task<ShowtimeSeatsResponseDto?> GetShowtimeSeatsAsync(int showtimeId);
}

public class ShowtimeService : IShowtimeService
{
    private readonly CinemaDbContext _context;

    public ShowtimeService(CinemaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ShowtimeResponseDto>> GetShowtimesAsync(DateTime? date, string? time, int? movieId, int? roomId)
    {
        // Expire outdated reservations first
        var now = DateTime.UtcNow;
        var expiredReservations = await _context.Reservations
            .Where(r => r.Status == "Active" && r.ExpiresAt <= now)
            .ToListAsync();

        if (expiredReservations.Count != 0)
        {
            foreach (var r in expiredReservations)
            {
                r.Status = "Expired";
            }
            await _context.SaveChangesAsync();
        }

        var query = _context.Showtimes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(s => s.Movie)
            .Include(s => s.Room)
            .Include(s => s.Tickets)
            .Include(s => s.Reservations)
            .Where(s => s.Status != "Cancelled");

        if (date.HasValue)
        {
            var targetDate = date.Value.Date;
            var nextDate = targetDate.AddDays(1);
            query = query.Where(s => s.StartTime >= targetDate && s.StartTime < nextDate);
        }

        if (!string.IsNullOrWhiteSpace(time) && TimeSpan.TryParse(time, out var targetTime))
        {
            // Within +/- 2 hours of target time or matching hour
            query = query.Where(s => s.StartTime.TimeOfDay >= targetTime.Add(TimeSpan.FromHours(-1)) 
                                  && s.StartTime.TimeOfDay <= targetTime.Add(TimeSpan.FromHours(2)));
        }

        if (movieId.HasValue)
        {
            query = query.Where(s => s.MovieId == movieId.Value);
        }

        if (roomId.HasValue)
        {
            query = query.Where(s => s.RoomId == roomId.Value);
        }

        var showtimes = await query
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        return showtimes.Select(s =>
        {
            var totalSeats = s.Room?.Capacity ?? 0;
            var soldSeats = s.Tickets.Count(t => t.Status == "Valid");
            var reservedSeats = s.Reservations.Count(r => r.Status == "Active" && r.ExpiresAt > now);
            var availableSeats = Math.Max(0, totalSeats - soldSeats - reservedSeats);

            return new ShowtimeResponseDto(
                s.Id,
                s.MovieId,
                s.Movie?.Title ?? string.Empty,
                s.Movie?.PosterUrl ?? string.Empty,
                s.Movie?.DurationMinutes ?? 0,
                s.Movie?.Genre ?? string.Empty,
                s.Movie?.Rating ?? "PG-13",
                s.RoomId,
                s.Room?.Name ?? string.Empty,
                s.Room?.RoomType ?? "2D",
                s.StartTime,
                s.EndTime,
                s.Price,
                s.Status,
                availableSeats,
                totalSeats
            );
        });
    }

    public async Task<ShowtimeResponseDto?> GetShowtimeByIdAsync(int id)
    {
        var s = await _context.Showtimes
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.Movie)
            .Include(x => x.Room)
            .Include(x => x.Tickets)
            .Include(x => x.Reservations)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (s == null) return null;

        var now = DateTime.UtcNow;
        var totalSeats = s.Room?.Capacity ?? 0;
        var soldSeats = s.Tickets.Count(t => t.Status == "Valid");
        var reservedSeats = s.Reservations.Count(r => r.Status == "Active" && r.ExpiresAt > now);
        var availableSeats = Math.Max(0, totalSeats - soldSeats - reservedSeats);

        return new ShowtimeResponseDto(
            s.Id,
            s.MovieId,
            s.Movie?.Title ?? string.Empty,
            s.Movie?.PosterUrl ?? string.Empty,
            s.Movie?.DurationMinutes ?? 0,
            s.Movie?.Genre ?? string.Empty,
            s.Movie?.Rating ?? "PG-13",
            s.RoomId,
            s.Room?.Name ?? string.Empty,
            s.Room?.RoomType ?? "2D",
            s.StartTime,
            s.EndTime,
            s.Price,
            s.Status,
            availableSeats,
            totalSeats
        );
    }

    public async Task<ShowtimeResponseDto> CreateShowtimeAsync(CreateShowtimeDto dto)
    {
        var movie = await _context.Movies.FindAsync(dto.MovieId)
            ?? throw new ArgumentException($"La película con ID {dto.MovieId} no existe.");

        var room = await _context.Rooms.FindAsync(dto.RoomId)
            ?? throw new ArgumentException($"La sala con ID {dto.RoomId} no existe.");

        var endTime = dto.StartTime.AddMinutes(movie.DurationMinutes + 15); // +15 min cleanup buffer

        // Check for room schedule collision
        var collision = await _context.Showtimes.AnyAsync(s =>
            s.RoomId == dto.RoomId &&
            s.Status != "Cancelled" &&
            ((dto.StartTime >= s.StartTime && dto.StartTime < s.EndTime) ||
             (endTime > s.StartTime && endTime <= s.EndTime)));

        if (collision)
        {
            throw new InvalidOperationException("La sala ya tiene una función programada en ese horario.");
        }

        var showtime = new Showtime
        {
            MovieId = dto.MovieId,
            RoomId = dto.RoomId,
            StartTime = dto.StartTime,
            EndTime = endTime,
            Price = dto.Price,
            Status = "Scheduled"
        };

        _context.Showtimes.Add(showtime);
        await _context.SaveChangesAsync();

        return new ShowtimeResponseDto(
            showtime.Id,
            movie.Id,
            movie.Title,
            movie.PosterUrl,
            movie.DurationMinutes,
            movie.Genre,
            movie.Rating,
            room.Id,
            room.Name,
            room.RoomType,
            showtime.StartTime,
            showtime.EndTime,
            showtime.Price,
            showtime.Status,
            room.Capacity,
            room.Capacity
        );
    }

    public async Task<ShowtimeSeatsResponseDto?> GetShowtimeSeatsAsync(int showtimeId)
    {
        var showtime = await _context.Showtimes
            .AsNoTracking()
            .Include(s => s.Movie)
            .Include(s => s.Room)
            .FirstOrDefaultAsync(s => s.Id == showtimeId);

        if (showtime == null || showtime.Room == null) return null;

        var allSeats = await _context.Seats
            .AsNoTracking()
            .Where(s => s.RoomId == showtime.RoomId)
            .OrderBy(s => s.RowCode)
            .ThenBy(s => s.SeatNumber)
            .ToListAsync();

        var now = DateTime.UtcNow;

        // Clean expired reservations
        var activeReservedSeatIds = await _context.Reservations
            .Where(r => r.ShowtimeId == showtimeId && r.Status == "Active" && r.ExpiresAt > now)
            .Select(r => r.SeatId)
            .ToListAsync();

        var soldSeatIds = await _context.Tickets
            .Where(t => t.ShowtimeId == showtimeId && t.Status == "Valid")
            .Select(t => t.SeatId)
            .ToListAsync();

        var seatLayout = allSeats.Select(s =>
        {
            string status = "Available";
            if (soldSeatIds.Contains(s.Id))
            {
                status = "Sold";
            }
            else if (activeReservedSeatIds.Contains(s.Id))
            {
                status = "Reserved";
            }

            // Calculate price based on seat type
            var seatPrice = showtime.Price;
            if (s.SeatType == "VIP")
            {
                seatPrice += 5.00m;
            }

            return new SeatLayoutDto(
                s.Id,
                s.RoomId,
                s.RowCode,
                s.SeatNumber,
                s.SeatCode,
                s.SeatType,
                status,
                seatPrice
            );
        }).ToList();

        return new ShowtimeSeatsResponseDto(
            showtime.Id,
            showtime.Movie?.Title ?? string.Empty,
            showtime.Room.Name,
            showtime.Room.RoomType,
            showtime.Room.Rows,
            showtime.Room.Columns,
            showtime.StartTime,
            showtime.Price,
            seatLayout
        );
    }
}
