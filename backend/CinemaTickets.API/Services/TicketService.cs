using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Services;

public interface ITicketService
{
    Task<ReservationResponseDto> ReserveSeatsAsync(ReserveSeatsDto dto);
    Task<PurchaseConfirmationDto> PurchaseTicketsAsync(PurchaseTicketsDto dto);
    Task<IEnumerable<TicketResponseDto>> GetUserTicketsAsync(int userId);
}

public class TicketService : ITicketService
{
    private readonly CinemaDbContext _context;

    public TicketService(CinemaDbContext context)
    {
        _context = context;
    }

    public async Task<ReservationResponseDto> ReserveSeatsAsync(ReserveSeatsDto dto)
    {
        if (dto.SeatIds == null || dto.SeatIds.Count == 0)
        {
            throw new ArgumentException("Debe seleccionar al menos un asiento.");
        }

        var showtime = await _context.Showtimes.FindAsync(dto.ShowtimeId)
            ?? throw new KeyNotFoundException($"Función {dto.ShowtimeId} no encontrada.");

        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(5); // 5-minute reservation hold as per skill requirement
        var reservationCode = "RES-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();

        // Use database transaction for concurrency protection
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Expire old reservations
            var expired = await _context.Reservations
                .Where(r => r.ShowtimeId == dto.ShowtimeId && r.Status == "Active" && r.ExpiresAt <= now)
                .ToListAsync();

            foreach (var r in expired)
            {
                r.Status = "Expired";
            }
            if (expired.Count > 0)
            {
                await _context.SaveChangesAsync();
            }

            // Check if any requested seat is already purchased
            var soldSeats = await _context.Tickets
                .Where(t => t.ShowtimeId == dto.ShowtimeId && dto.SeatIds.Contains(t.SeatId) && t.Status == "Valid")
                .Select(t => t.SeatId)
                .ToListAsync();

            if (soldSeats.Count > 0)
            {
                throw new InvalidOperationException($"Los asientos [{string.Join(", ", soldSeats)}] ya han sido comprados.");
            }

            // Check if any requested seat is currently actively reserved
            var activelyReservedSeats = await _context.Reservations
                .Where(r => r.ShowtimeId == dto.ShowtimeId && dto.SeatIds.Contains(r.SeatId) && r.Status == "Active" && r.ExpiresAt > now)
                .Select(r => r.SeatId)
                .ToListAsync();

            if (activelyReservedSeats.Count > 0)
            {
                throw new InvalidOperationException($"Los asientos [{string.Join(", ", activelyReservedSeats)}] se encuentran reservados temporalmente por otro cliente.");
            }

            // Create new reservations
            var newReservations = dto.SeatIds.Select(seatId => new Reservation
            {
                ShowtimeId = dto.ShowtimeId,
                SeatId = seatId,
                UserId = dto.UserId,
                ReservationCode = reservationCode,
                ReservedAt = now,
                ExpiresAt = expiresAt,
                Status = "Active"
            }).ToList();

            _context.Reservations.AddRange(newReservations);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new ReservationResponseDto(
                reservationCode,
                dto.ShowtimeId,
                dto.SeatIds,
                now,
                expiresAt,
                300, // 300 seconds (5 min)
                "Active"
            );
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PurchaseConfirmationDto> PurchaseTicketsAsync(PurchaseTicketsDto dto)
    {
        if (dto.SeatIds == null || dto.SeatIds.Count == 0)
        {
            throw new ArgumentException("Debe seleccionar al menos un asiento.");
        }

        var showtime = await _context.Showtimes
            .Include(s => s.Movie)
            .Include(s => s.Room)
            .FirstOrDefaultAsync(s => s.Id == dto.ShowtimeId)
            ?? throw new KeyNotFoundException($"Función {dto.ShowtimeId} no encontrada.");

        var now = DateTime.UtcNow;
        var transactionId = "TXN-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Find or create user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.CustomerEmail.ToLower());
            if (user == null)
            {
                user = new User
                {
                    Name = dto.CustomerName.Trim(),
                    Email = dto.CustomerEmail.Trim().ToLowerInvariant(),
                    DocumentId = dto.DocumentId.Trim(),
                    CreatedAt = now
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // If reservation code was provided, mark it as Confirmed
            if (!string.IsNullOrWhiteSpace(dto.ReservationCode))
            {
                var reservationItems = await _context.Reservations
                    .Where(r => r.ReservationCode == dto.ReservationCode && r.ShowtimeId == dto.ShowtimeId)
                    .ToListAsync();

                foreach (var res in reservationItems)
                {
                    res.Status = "Confirmed";
                }
            }

            // Validate that none of the seats are already sold
            var alreadySold = await _context.Tickets
                .Where(t => t.ShowtimeId == dto.ShowtimeId && dto.SeatIds.Contains(t.SeatId) && t.Status == "Valid")
                .Select(t => t.SeatId)
                .ToListAsync();

            if (alreadySold.Count > 0)
            {
                throw new InvalidOperationException($"El asiento {alreadySold.First()} ya fue comprado por otro usuario.");
            }

            // Fetch seat details to compute final prices
            var seats = await _context.Seats
                .Where(s => dto.SeatIds.Contains(s.Id))
                .ToListAsync();

            var tickets = new List<Ticket>();
            var ticketResponseDtos = new List<TicketResponseDto>();
            decimal totalPaid = 0m;

            foreach (var seat in seats)
            {
                var seatPrice = showtime.Price;
                if (seat.SeatType == "VIP")
                {
                    seatPrice += 5.00m;
                }

                totalPaid += seatPrice;
                var ticketCode = "TKT-" + Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
                var qrPayload = $"CINEPASS|{ticketCode}|SHOW:{showtime.Id}|SEAT:{seat.SeatCode}|USR:{user.Id}";

                var ticket = new Ticket
                {
                    TicketCode = ticketCode,
                    ShowtimeId = showtime.Id,
                    SeatId = seat.Id,
                    UserId = user.Id,
                    PricePaid = seatPrice,
                    PaymentMethod = dto.PaymentMethod,
                    TransactionId = transactionId,
                    QrPayload = qrPayload,
                    Status = "Valid",
                    PurchasedAt = now
                };

                tickets.Add(ticket);

                ticketResponseDtos.Add(new TicketResponseDto(
                    0, // will be populated after save
                    ticketCode,
                    showtime.Id,
                    showtime.Movie?.Title ?? "Cine Película",
                    showtime.Movie?.PosterUrl ?? string.Empty,
                    showtime.Room?.Name ?? "Sala",
                    showtime.Room?.RoomType ?? "2D",
                    seat.SeatCode,
                    seat.SeatType,
                    showtime.StartTime,
                    seatPrice,
                    dto.PaymentMethod,
                    transactionId,
                    qrPayload,
                    "Valid",
                    now,
                    user.Name,
                    user.Email
                ));
            }

            _context.Tickets.AddRange(tickets);
            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return new PurchaseConfirmationDto(
                transactionId,
                now,
                totalPaid,
                dto.PaymentMethod,
                user.Name,
                user.Email,
                ticketResponseDtos
            );
        }
        catch
        {
            await dbTransaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IEnumerable<TicketResponseDto>> GetUserTicketsAsync(int userId)
    {
        var tickets = await _context.Tickets
            .AsNoTracking()
            .Include(t => t.Showtime)
                .ThenInclude(s => s!.Movie)
            .Include(t => t.Showtime)
                .ThenInclude(s => s!.Room)
            .Include(t => t.Seat)
            .Include(t => t.User)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.PurchasedAt)
            .ToListAsync();

        return tickets.Select(t => new TicketResponseDto(
            t.Id,
            t.TicketCode,
            t.ShowtimeId,
            t.Showtime?.Movie?.Title ?? string.Empty,
            t.Showtime?.Movie?.PosterUrl ?? string.Empty,
            t.Showtime?.Room?.Name ?? string.Empty,
            t.Showtime?.Room?.RoomType ?? "2D",
            t.Seat?.SeatCode ?? string.Empty,
            t.Seat?.SeatType ?? "Standard",
            t.Showtime?.StartTime ?? DateTime.MinValue,
            t.PricePaid,
            t.PaymentMethod,
            t.TransactionId,
            t.QrPayload,
            t.Status,
            t.PurchasedAt,
            t.User?.Name ?? string.Empty,
            t.User?.Email ?? string.Empty
        ));
    }
}
