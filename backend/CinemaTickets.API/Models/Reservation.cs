using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("reservations")]
public class Reservation
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("showtime_id")]
    public int ShowtimeId { get; set; }

    [Column("seat_id")]
    public int SeatId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("reservation_code")]
    public string ReservationCode { get; set; } = Guid.NewGuid().ToString("N");

    [Column("reserved_at")]
    public DateTime ReservedAt { get; set; } = DateTime.UtcNow;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "Active"; // Active, Confirmed, Expired, Cancelled

    // Navigation properties
    [ForeignKey("ShowtimeId")]
    public Showtime? Showtime { get; set; }

    [ForeignKey("SeatId")]
    public Seat? Seat { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
}
