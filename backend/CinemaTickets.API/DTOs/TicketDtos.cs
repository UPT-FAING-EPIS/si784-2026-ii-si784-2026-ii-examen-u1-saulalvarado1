using System.ComponentModel.DataAnnotations;

namespace CinemaTickets.API.DTOs;

public record PurchaseTicketsDto(
    [Required(ErrorMessage = "El ID de la función es obligatorio.")]
    int ShowtimeId,

    [Required(ErrorMessage = "Debe especificar los asientos a comprar.")]
    [MinLength(1, ErrorMessage = "Debe especificar al menos un asiento.")]
    List<int> SeatIds,

    [Required(ErrorMessage = "El nombre del comprador es obligatorio.")]
    [StringLength(100, MinimumLength = 2)]
    string CustomerName,

    [Required(ErrorMessage = "El email del comprador es obligatorio.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    string CustomerEmail,

    [Required(ErrorMessage = "El documento de identidad es obligatorio.")]
    [StringLength(20, MinimumLength = 5)]
    string DocumentId,

    string? ReservationCode,

    [Required(ErrorMessage = "El método de pago es obligatorio.")]
    string PaymentMethod = "CreditCard" // CreditCard, Yape, Plin, Cash
);

public record TicketResponseDto(
    int TicketId,
    string TicketCode,
    int ShowtimeId,
    string MovieTitle,
    string MoviePosterUrl,
    string RoomName,
    string RoomType,
    string SeatCode,
    string SeatType,
    DateTime StartTime,
    decimal PricePaid,
    string PaymentMethod,
    string TransactionId,
    string QrPayload,
    string Status,
    DateTime PurchasedAt,
    string CustomerName,
    string CustomerEmail
);

public record PurchaseConfirmationDto(
    string TransactionId,
    DateTime PurchasedAt,
    decimal TotalPaid,
    string PaymentMethod,
    string CustomerName,
    string CustomerEmail,
    List<TicketResponseDto> Tickets
);
