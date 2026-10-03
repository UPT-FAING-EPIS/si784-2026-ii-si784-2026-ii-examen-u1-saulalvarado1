using System.ComponentModel.DataAnnotations;

namespace CinemaTickets.API.DTOs;

public record CreateUserDto(
    [Required] string Name,
    [Required][EmailAddress] string Email,
    string Phone,
    string DocumentId
);

public record UserResponseDto(
    int Id,
    string Name,
    string Email,
    string Phone,
    string DocumentId,
    DateTime CreatedAt
);

public record RoomDto(
    int Id,
    string Name,
    int Capacity,
    string RoomType,
    int Rows,
    int Columns
);

public record CreateRoomDto(
    [Required] string Name,
    string RoomType = "2D",
    int Rows = 6,
    int Columns = 8
);
