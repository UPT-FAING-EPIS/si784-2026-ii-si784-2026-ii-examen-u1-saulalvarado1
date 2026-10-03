using System.ComponentModel.DataAnnotations;

namespace CinemaTickets.API.DTOs;

public record ReserveSeatsDto(
    [Required(ErrorMessage = "El ID de la función es obligatorio.")]
    int ShowtimeId,

    [Required(ErrorMessage = "Debe seleccionar al menos un asiento.")]
    [MinLength(1, ErrorMessage = "Debe seleccionar al menos un asiento.")]
    List<int> SeatIds,

    int? UserId
);

public record ReservationResponseDto(
    string ReservationCode,
    int ShowtimeId,
    List<int> ReservedSeatIds,
    DateTime ReservedAt,
    DateTime ExpiresAt,
    int SecondsRemaining,
    string Status
);
