using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("movies")]
public class Movie
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    [Column("synopsis")]
    public string Synopsis { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("genre")]
    public string Genre { get; set; } = string.Empty;

    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [MaxLength(500)]
    [Column("poster_url")]
    public string PosterUrl { get; set; } = string.Empty;

    [MaxLength(10)]
    [Column("rating")]
    public string Rating { get; set; } = "PG-13"; // G, PG, PG-13, R

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}
