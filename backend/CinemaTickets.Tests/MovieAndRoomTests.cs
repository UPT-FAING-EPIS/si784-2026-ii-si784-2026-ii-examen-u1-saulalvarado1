using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace CinemaTickets.Tests;

public class MovieAndRoomTests
{
    private static CinemaDbContext CreateInMemoryDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<CinemaDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new CinemaDbContext(options);
    }

    [Fact]
    public async Task CreateMovie_And_GetAllMovies_ReturnsExpectedResults()
    {
        using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var movieService = new MovieService(context);

        var createDto = new CreateMovieDto(
            "Inception",
            "A thief who steals corporate secrets through dream-sharing technology.",
            "Sci-Fi",
            148,
            "https://example.com/inception.jpg",
            "PG-13"
        );

        var created = await movieService.CreateMovieAsync(createDto);
        Assert.NotNull(created);
        Assert.Equal("Inception", created.Title);

        var movies = await movieService.GetAllMoviesAsync();
        Assert.Single(movies);
        Assert.Equal("Inception", movies.First().Title);

        var fetched = await movieService.GetMovieByIdAsync(created.Id);
        Assert.NotNull(fetched);
        Assert.Equal("Inception", fetched.Title);
    }

    [Fact]
    public async Task CreateRoom_GeneratesCorrectSeatsCount()
    {
        using var context = CreateInMemoryDbContext(Guid.NewGuid().ToString());
        var roomService = new RoomService(context);

        var createRoomDto = new CreateRoomDto(
            "Sala Premium 3D",
            "3D",
            4,
            5
        );

        var room = await roomService.CreateRoomAsync(createRoomDto);
        Assert.NotNull(room);
        Assert.Equal(20, room.Capacity);

        var rooms = await roomService.GetAllRoomsAsync();
        Assert.Single(rooms);

        var seats = await context.Seats.Where(s => s.RoomId == room.Id).ToListAsync();
        Assert.Equal(20, seats.Count);
    }
}
