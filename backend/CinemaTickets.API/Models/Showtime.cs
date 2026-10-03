using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("showtimes")]
public class Showtime
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("room_id")]
    public int RoomId { get; set; }

    [Column("start_time")]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime EndTime { get; set; }

    [Column("price", TypeName = "decimal(10,2)")]
    public decimal Price { get; set; } = 15.00m;

    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "Scheduled"; // Scheduled, InProgress, Completed, Cancelled

    // Navigation properties
    [ForeignKey("MovieId")]
    public Movie? Movie { get; set; }

    [ForeignKey("RoomId")]
    public Room? Room { get; set; }

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
