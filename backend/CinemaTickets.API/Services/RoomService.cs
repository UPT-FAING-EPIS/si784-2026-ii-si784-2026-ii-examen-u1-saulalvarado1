using Microsoft.EntityFrameworkCore;
using CinemaTickets.API.Data;
using CinemaTickets.API.DTOs;
using CinemaTickets.API.Models;

namespace CinemaTickets.API.Services;

public interface IRoomService
{
    Task<IEnumerable<RoomDto>> GetAllRoomsAsync();
    Task<RoomDto?> GetRoomByIdAsync(int id);
    Task<RoomDto> CreateRoomAsync(CreateRoomDto dto);
}

public class RoomService : IRoomService
{
    private readonly CinemaDbContext _context;

    public RoomService(CinemaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
    {
        return await _context.Rooms
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .Select(r => new RoomDto(r.Id, r.Name, r.Capacity, r.RoomType, r.Rows, r.Columns))
            .ToListAsync();
    }

    public async Task<RoomDto?> GetRoomByIdAsync(int id)
    {
        var room = await _context.Rooms.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        if (room == null) return null;

        return new RoomDto(room.Id, room.Name, room.Capacity, room.RoomType, room.Rows, room.Columns);
    }

    public async Task<RoomDto> CreateRoomAsync(CreateRoomDto dto)
    {
        var capacity = dto.Rows * dto.Columns;
        var room = new Room
        {
            Name = dto.Name.Trim(),
            Capacity = capacity,
            RoomType = dto.RoomType,
            Rows = dto.Rows,
            Columns = dto.Columns
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        // Automatically generate seats for the room
        var seats = new List<Seat>();
        for (int r = 0; r < dto.Rows; r++)
        {
            char rowChar = (char)('A' + r);
            string seatType = (r >= dto.Rows - 2) ? "VIP" : "Standard"; // Last 2 rows are VIP

            for (int c = 1; c <= dto.Columns; c++)
            {
                seats.Add(new Seat
                {
                    RoomId = room.Id,
                    RowCode = rowChar.ToString(),
                    SeatNumber = c,
                    SeatCode = $"{rowChar}-{c}",
                    SeatType = seatType
                });
            }
        }

        _context.Seats.AddRange(seats);
        await _context.SaveChangesAsync();

        return new RoomDto(room.Id, room.Name, room.Capacity, room.RoomType, room.Rows, room.Columns);
    }
}
