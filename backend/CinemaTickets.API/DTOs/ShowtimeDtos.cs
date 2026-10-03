using System.ComponentModel.DataAnnotations;

namespace CinemaTickets.API.DTOs;

public record CreateShowtimeDto(
    [Required(ErrorMessage = "El ID de la película es obligatorio.")]
    int MovieId,

    [Required(ErrorMessage = "El ID de la sala es obligatorio.")]
    int RoomId,

    [Required(ErrorMessage = "La fecha y hora de inicio es obligatoria.")]
    DateTime StartTime,

    [Range(0.01, 500.00, ErrorMessage = "El precio debe ser mayor a 0.")]
    decimal Price
);

public record ShowtimeResponseDto(
    int Id,
    int MovieId,
    string MovieTitle,
    string MoviePosterUrl,
    int MovieDurationMinutes,
    string MovieGenre,
    string MovieRating,
    int RoomId,
    string RoomName,
    string RoomType,
    DateTime StartTime,
    DateTime EndTime,
    decimal Price,
    string Status,
    int AvailableSeatsCount,
    int TotalSeatsCount
);
