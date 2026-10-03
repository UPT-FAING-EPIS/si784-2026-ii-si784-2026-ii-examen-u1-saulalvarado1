using System.ComponentModel.DataAnnotations;

namespace CinemaTickets.API.DTOs;

public record CreateMovieDto(
    [Required(ErrorMessage = "El título de la película es obligatorio.")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "El título debe tener entre 1 y 200 caracteres.")]
    string Title,

    [Required(ErrorMessage = "La sinopsis es obligatoria.")]
    [StringLength(1000, ErrorMessage = "La sinopsis no puede exceder 1000 caracteres.")]
    string Synopsis,

    [Required(ErrorMessage = "El género es obligatorio.")]
    [StringLength(100)]
    string Genre,

    [Range(1, 400, ErrorMessage = "La duración debe estar entre 1 y 400 minutos.")]
    int DurationMinutes,

    [Url(ErrorMessage = "El póster debe ser una URL válida.")]
    string PosterUrl,

    [RegularExpression("^(G|PG|PG-13|R|NC-17)$", ErrorMessage = "Clasificación no válida (G, PG, PG-13, R, NC-17).")]
    string Rating = "PG-13"
);

public record MovieResponseDto(
    int Id,
    string Title,
    string Synopsis,
    string Genre,
    int DurationMinutes,
    string PosterUrl,
    string Rating,
    bool IsActive
);
