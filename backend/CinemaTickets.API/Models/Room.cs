using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("rooms")]
public class Room
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("capacity")]
    public int Capacity { get; set; }

    [MaxLength(50)]
    [Column("room_type")]
    public string RoomType { get; set; } = "2D"; // 2D, 3D, IMAX, VIP

    [Column("rows")]
    public int Rows { get; set; } = 6;

    [Column("columns")]
    public int Columns { get; set; } = 8;

    // Navigation properties
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
