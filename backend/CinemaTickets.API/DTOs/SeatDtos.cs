namespace CinemaTickets.API.DTOs;

public record SeatLayoutDto(
    int Id,
    int RoomId,
    string RowCode,
    int SeatNumber,
    string SeatCode,
    string SeatType,
    string Status, // "Available", "Reserved", "Sold"
    decimal Price
);

public record ShowtimeSeatsResponseDto(
    int ShowtimeId,
    string MovieTitle,
    string RoomName,
    string RoomType,
    int Rows,
    int Columns,
    DateTime StartTime,
    decimal BasePrice,
    List<SeatLayoutDto> Seats
);
