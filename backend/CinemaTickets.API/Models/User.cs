using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaTickets.API.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("phone")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("document_id")]
    public string DocumentId { get; set; } = string.Empty; // DNI / Passport

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
