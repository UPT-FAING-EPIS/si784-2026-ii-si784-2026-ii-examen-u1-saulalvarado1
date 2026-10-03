using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("tickets")]
public class Ticket
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("ticket_code")]
    public string TicketCode { get; set; } = string.Empty;

    [Column("showtime_id")]
    public int ShowtimeId { get; set; }

    [Column("seat_id")]
    public int SeatId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("price_paid", TypeName = "decimal(10,2)")]
    public decimal PricePaid { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string PaymentMethod { get; set; } = "CreditCard"; // CreditCard, Yape, Plin, Cash

    [MaxLength(100)]
    [Column("transaction_id")]
    public string TransactionId { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("qr_payload")]
    public string QrPayload { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "Valid"; // Valid, Used, Cancelled, Refunded

    [Column("purchased_at")]
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ShowtimeId")]
    public Showtime? Showtime { get; set; }

    [ForeignKey("SeatId")]
    public Seat? Seat { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}
