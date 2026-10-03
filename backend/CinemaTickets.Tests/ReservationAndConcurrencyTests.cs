using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;
using CinemaTickets.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace CinemaTickets.Tests;

public class ReservationAndConcurrencyTests
{
    private CinemaDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<CinemaDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new CinemaDbContext(options);
    }

    private async Task SeedBasicDataAsync(CinemaDbContext context)
    {
        var movie = new Movie
        {
            Id = 1,
            Title = "Interstellar",
            Genre = "Sci-Fi",
            DurationMinutes = 169,
            Rating = "PG-13",
            PosterUrl = "https://example.com/poster.jpg"
        };

        var room = new Room
        {
            Id = 1,
            Name = "Sala 1",
            Capacity = 2,
            RoomType = "2D",
            Rows = 1,
            Columns = 2
        };

        var seats = new List<Seat>
        {
            new() { Id = 1, RoomId = 1, RowCode = "A", SeatNumber = 1, SeatCode = "A-1", SeatType = "Standard" },
            new() { Id = 2, RoomId = 1, RowCode = "A", SeatNumber = 2, SeatCode = "A-2", SeatType = "Standard" }
        };

        var showtime = new Showtime
        {
            Id = 1,
            MovieId = 1,
            RoomId = 1,
            StartTime = DateTime.UtcNow.AddHours(2),
            EndTime = DateTime.UtcNow.AddHours(5),
            Price = 20.00m,
            Status = "Scheduled"
        };

        context.Movies.Add(movie);
        context.Rooms.Add(room);
        context.Seats.AddRange(seats);
        context.Showtimes.Add(showtime);
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task ReserveSeats_ShouldSucceed_WhenSeatsAreAvailable()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Reserve_Success");
        await SeedBasicDataAsync(context);
        var service = new TicketService(context);

        var dto = new ReserveSeatsDto(
            ShowtimeId: 1,
            SeatIds: new List<int> { 1 },
            UserId: null
        );

        // Act
        var result = await service.ReserveSeatsAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.StartsWith("RES-", result.ReservationCode);
        Assert.Equal("Active", result.Status);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);
        Assert.Contains(1, result.ReservedSeatIds);
    }

    [Fact]
    public async Task ReserveSeats_ShouldThrowException_WhenSeatIsAlreadyReserved()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Reserve_Conflict");
        await SeedBasicDataAsync(context);
        var service = new TicketService(context);

        // First user reserves seat 1
        await service.ReserveSeatsAsync(new ReserveSeatsDto(1, new List<int> { 1 }, null));

        // Act & Assert: Second user tries to reserve seat 1
        var secondDto = new ReserveSeatsDto(1, new List<int> { 1 }, null);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ReserveSeatsAsync(secondDto));
    }

    [Fact]
    public async Task PurchaseTickets_ShouldCreateValidTickets_AndPreventDuplicatePurchase()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Purchase_Success");
        await SeedBasicDataAsync(context);
        var service = new TicketService(context);

        var purchaseDto = new PurchaseTicketsDto(
            ShowtimeId: 1,
            SeatIds: new List<int> { 1 },
            CustomerName: "Juan Perez",
            CustomerEmail: "juan.perez@epis.pe",
            DocumentId: "78965412",
            ReservationCode: null,
            PaymentMethod: "CreditCard"
        );

        // Act
        var confirmation = await service.PurchaseTicketsAsync(purchaseDto);

        // Assert
        Assert.NotNull(confirmation);
        Assert.Single(confirmation.Tickets);
        Assert.Equal("Juan Perez", confirmation.CustomerName);
        Assert.StartsWith("TXN-", confirmation.TransactionId);

        // Verify ticket in DB
        var ticketInDb = await context.Tickets.FirstOrDefaultAsync(t => t.SeatId == 1 && t.ShowtimeId == 1);
        Assert.NotNull(ticketInDb);
        Assert.Equal("Valid", ticketInDb.Status);

        // Act & Assert: Attempting to purchase the same seat again should fail
        var secondPurchase = new PurchaseTicketsDto(
            ShowtimeId: 1,
            SeatIds: new List<int> { 1 },
            CustomerName: "Maria Lopez",
            CustomerEmail: "maria.lopez@epis.pe",
            DocumentId: "74589632",
            ReservationCode: null,
            PaymentMethod: "CreditCard"
        );

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.PurchaseTicketsAsync(secondPurchase));
    }

    [Fact]
    public async Task ExpiredReservations_ShouldAllowNewBooking()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Expired_Reservation");
        await SeedBasicDataAsync(context);
        var service = new TicketService(context);

        // Add an already expired reservation for seat 1
        context.Reservations.Add(new Reservation
        {
            ShowtimeId = 1,
            SeatId = 1,
            ReservationCode = "RES-OLD",
            ReservedAt = DateTime.UtcNow.AddMinutes(-10),
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5), // Expired!
            Status = "Active"
        });
        await context.SaveChangesAsync();

        // Act: New user tries to reserve seat 1
        var newReservation = await service.ReserveSeatsAsync(new ReserveSeatsDto(1, new List<int> { 1 }, null));

        // Assert: Succeeds because previous reservation was expired
        Assert.NotNull(newReservation);
        Assert.Equal("Active", newReservation.Status);
    }
}
