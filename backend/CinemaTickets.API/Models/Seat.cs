using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("seats")]
public class Seat
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("room_id")]
    public int RoomId { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("row_code")]
    public string RowCode { get; set; } = string.Empty; // e.g. "A", "B", "C"

    [Column("seat_number")]
    public int SeatNumber { get; set; } // e.g. 1, 2, 3...

    [Required]
    [MaxLength(20)]
    [Column("seat_code")]
    public string SeatCode { get; set; } = string.Empty; // e.g. "A-1", "B-4"

    [MaxLength(20)]
    [Column("seat_type")]
    public string SeatType { get; set; } = "Standard"; // Standard, VIP, Preferential

    // Navigation property
    [ForeignKey("RoomId")]
    public Room? Room { get; set; }
}
