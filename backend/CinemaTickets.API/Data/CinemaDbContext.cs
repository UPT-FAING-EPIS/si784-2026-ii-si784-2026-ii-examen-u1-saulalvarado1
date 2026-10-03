using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Data;

public class CinemaDbContext : DbContext
{
    public CinemaDbContext(DbContextOptions<CinemaDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<Showtime> Showtimes => Set<Showtime>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique constraint: A seat in a showtime cannot have more than one confirmed ticket
        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.ShowtimeId, t.SeatId })
            .IsUnique();

        // Unique ticket code
        modelBuilder.Entity<Ticket>()
            .HasIndex(t => t.TicketCode)
            .IsUnique();

        // Unique user email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Composite index on Showtime for fast date/time searches
        modelBuilder.Entity<Showtime>()
            .HasIndex(s => new { s.StartTime, s.MovieId, s.RoomId });

        // Composite index for Seat
        modelBuilder.Entity<Seat>()
            .HasIndex(s => new { s.RoomId, s.RowCode, s.SeatNumber })
            .IsUnique();

        // Index on Reservation for expiration checks
        modelBuilder.Entity<Reservation>()
            .HasIndex(r => new { r.ShowtimeId, r.SeatId, r.Status });

        // Configure decimal precision
        modelBuilder.Entity<Showtime>()
            .Property(s => s.Price)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Ticket>()
            .Property(t => t.PricePaid)
            .HasPrecision(10, 2);
    }
}
