using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;
using CinemaTickets.API.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CinemaTickets.Tests;

public class ShowtimeFilteringTests
{
    private CinemaDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<CinemaDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        return new CinemaDbContext(options);
    }

    [Fact]
    public async Task GetShowtimes_ShouldFilterByDateAndMovie()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Showtimes_Filter");
        var movie1 = new Movie { Id = 1, Title = "Movie A", Genre = "Action", DurationMinutes = 120 };
        var movie2 = new Movie { Id = 2, Title = "Movie B", Genre = "Comedy", DurationMinutes = 90 };
        var room = new Room { Id = 1, Name = "Sala 1", Capacity = 10, Rows = 2, Columns = 5 };

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        context.Movies.AddRange(movie1, movie2);
        context.Rooms.Add(room);

        // Showtime for Movie 1 today at 15:00
        context.Showtimes.Add(new Showtime
        {
            Id = 1,
            MovieId = 1,
            RoomId = 1,
            StartTime = today.AddHours(15),
            EndTime = today.AddHours(17),
            Price = 15.00m,
            Status = "Scheduled"
        });

        // Showtime for Movie 2 today at 19:00
        context.Showtimes.Add(new Showtime
        {
            Id = 2,
            MovieId = 2,
            RoomId = 1,
            StartTime = today.AddHours(19),
            EndTime = today.AddHours(21),
            Price = 18.00m,
            Status = "Scheduled"
        });

        // Showtime for Movie 1 tomorrow at 15:00
        context.Showtimes.Add(new Showtime
        {
            Id = 3,
            MovieId = 1,
            RoomId = 1,
            StartTime = tomorrow.AddHours(15),
            EndTime = tomorrow.AddHours(17),
            Price = 15.00m,
            Status = "Scheduled"
        });

        await context.SaveChangesAsync();
        var service = new ShowtimeService(context);

        // Act 1: Filter by today
        var todayResults = (await service.GetShowtimesAsync(today, null, null, null)).ToList();
        Assert.Equal(2, todayResults.Count);

        // Act 2: Filter by today AND Movie 1
        var movie1TodayResults = (await service.GetShowtimesAsync(today, null, 1, null)).ToList();
        Assert.Single(movie1TodayResults);
        Assert.Equal("Movie A", movie1TodayResults[0].MovieTitle);

        // Act 3: Filter by tomorrow
        var tomorrowResults = (await service.GetShowtimesAsync(tomorrow, null, null, null)).ToList();
        Assert.Single(tomorrowResults);
        Assert.Equal(3, tomorrowResults[0].Id);
    }

    [Fact]
    public async Task CreateShowtime_ShouldDetectCollision_WhenRoomIsAlreadyBooked()
    {
        // Arrange
        using var context = CreateInMemoryDbContext("TestDb_Showtimes_Collision");
        var movie = new Movie { Id = 1, Title = "Movie A", DurationMinutes = 120 };
        var room = new Room { Id = 1, Name = "Sala 1", Capacity = 50, Rows = 5, Columns = 10 };

        var baseTime = DateTime.UtcNow.Date.AddHours(16);
        context.Movies.Add(movie);
        context.Rooms.Add(room);
        context.Showtimes.Add(new Showtime
        {
            Id = 1,
            MovieId = 1,
            RoomId = 1,
            StartTime = baseTime,
            EndTime = baseTime.AddHours(2).AddMinutes(15),
            Price = 20.00m,
            Status = "Scheduled"
        });
        await context.SaveChangesAsync();

        var service = new ShowtimeService(context);

        // Act & Assert: Trying to schedule overlapping showtime in the same room
        var conflictingDto = new CreateShowtimeDto(
            MovieId: 1,
            RoomId: 1,
            StartTime: baseTime.AddMinutes(30), // Overlaps!
            Price: 20.00m
        );

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateShowtimeAsync(conflictingDto));
    }
}
