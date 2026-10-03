using CinemaTickets.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaTickets.API.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(CinemaDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Movies.AnyAsync())
        {
            return; // DB already seeded
        }

        // 1. Seed Movies
        var movies = new List<Movie>
        {
            new() {
                Title = "Gladiator II",
                Synopsis = "Años después de presenciar la muerte del admirado héroe Máximo a manos de su tío, Lucio debe entrar en el Coliseo tras ser testigo de la conquista de su hogar por parte de los tiránicos emperadores.",
                Genre = "Acción / Épico",
                DurationMinutes = 148,
                PosterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
                Rating = "R",
                IsActive = true
            },
            new() {
                Title = "Wicked",
                Synopsis = "La historia no contada de las brujas de Oz: Elphaba, una joven incomprendida debido a su inusual piel verde, y Glinda, una joven popular dorada por el privilegio.",
                Genre = "Musical / Fantasía",
                DurationMinutes = 160,
                PosterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
                Rating = "PG",
                IsActive = true
            },
            new() {
                Title = "Dune: Parte Dos",
                Synopsis = "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia, enfrentándose a una elección entre el amor de su vida y el destino del universo.",
                Genre = "Ciencia Ficción / Aventura",
                DurationMinutes = 166,
                PosterUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
                Rating = "PG-13",
                IsActive = true
            },
            new() {
                Title = "Deadpool & Wolverine",
                Synopsis = "Un apático Wade Wilson se afana en la vida civil dejando atrás sus días como Deadpool moralmente flexible. Pero cuando su mundo natal se enfrenta a una amenaza existencial, debe vestir el traje de nuevo.",
                Genre = "Acción / Comedia",
                DurationMinutes = 128,
                PosterUrl = "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
                Rating = "R",
                IsActive = true
            },
            new() {
                Title = "Intensamente 2 (Inside Out 2)",
                Synopsis = "Las vocecitas dentro de la cabeza de Riley la conocen por dentro y por fuera, pero todo cambiará con la llegada de una nueva emoción: Ansiedad.",
                Genre = "Animación / Familiar",
                DurationMinutes = 96,
                PosterUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
                Rating = "PG",
                IsActive = true
            }
        };

        context.Movies.AddRange(movies);
        await context.SaveChangesAsync();

        // 2. Seed Rooms
        var rooms = new List<Room>
        {
            new() { Name = "Sala 1 - IMAX Laser", Capacity = 48, RoomType = "IMAX", Rows = 6, Columns = 8 },
            new() { Name = "Sala 2 - Dolby Atmos 3D", Capacity = 48, RoomType = "3D", Rows = 6, Columns = 8 },
            new() { Name = "Sala 3 - VIP Lounge", Capacity = 32, RoomType = "VIP", Rows = 4, Columns = 8 },
            new() { Name = "Sala 4 - Premier 2D", Capacity = 48, RoomType = "2D", Rows = 6, Columns = 8 }
        };

        context.Rooms.AddRange(rooms);
        await context.SaveChangesAsync();

        // 3. Seed Seats for all rooms
        var seats = new List<Seat>();
        foreach (var room in rooms)
        {
            for (int r = 0; r < room.Rows; r++)
            {
                char rowChar = (char)('A' + r);
                bool isVip = (room.RoomType == "VIP") || (r >= room.Rows - 2);

                for (int c = 1; c <= room.Columns; c++)
                {
                    seats.Add(new Seat
                    {
                        RoomId = room.Id,
                        RowCode = rowChar.ToString(),
                        SeatNumber = c,
                        SeatCode = $"{rowChar}-{c}",
                        SeatType = isVip ? "VIP" : "Standard"
                    });
                }
            }
        }

        context.Seats.AddRange(seats);
        await context.SaveChangesAsync();

        // 4. Seed Users
        var users = new List<User>
        {
            new() { Name = "Carlos Mendoza", Email = "carlos.mendoza@epis.edu.pe", Phone = "952123456", DocumentId = "72345678" },
            new() { Name = "Lucia Ramos", Email = "lucia.ramos@epis.edu.pe", Phone = "952789123", DocumentId = "71890123" },
            new() { Name = "Admin CinePass", Email = "admin@cinepass.pe", Phone = "999888777", DocumentId = "40123456" }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // 5. Seed Showtimes for the current week (7 days)
        var today = DateTime.UtcNow.Date;
        var showtimes = new List<Showtime>();

        for (int dayOffset = 0; dayOffset < 7; dayOffset++)
        {
            var date = today.AddDays(dayOffset);

            // Movie 1 in Room 1 (IMAX)
            showtimes.Add(new Showtime
            {
                MovieId = movies[0].Id,
                RoomId = rooms[0].Id,
                StartTime = date.AddHours(15).AddMinutes(0),
                EndTime = date.AddHours(17).AddMinutes(30),
                Price = 25.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[0].Id,
                RoomId = rooms[0].Id,
                StartTime = date.AddHours(18).AddMinutes(30),
                EndTime = date.AddHours(21).AddMinutes(0),
                Price = 28.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[0].Id,
                RoomId = rooms[0].Id,
                StartTime = date.AddHours(21).AddMinutes(45),
                EndTime = date.AddHours(23).AddMinutes(59),
                Price = 28.00m,
                Status = "Scheduled"
            });

            // Movie 2 in Room 2 (3D)
            showtimes.Add(new Showtime
            {
                MovieId = movies[1].Id,
                RoomId = rooms[1].Id,
                StartTime = date.AddHours(14).AddMinutes(30),
                EndTime = date.AddHours(17).AddMinutes(15),
                Price = 22.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[1].Id,
                RoomId = rooms[1].Id,
                StartTime = date.AddHours(18).AddMinutes(0),
                EndTime = date.AddHours(20).AddMinutes(45),
                Price = 22.00m,
                Status = "Scheduled"
            });

            // Movie 3 in Room 3 (VIP)
            showtimes.Add(new Showtime
            {
                MovieId = movies[2].Id,
                RoomId = rooms[2].Id,
                StartTime = date.AddHours(16).AddMinutes(0),
                EndTime = date.AddHours(18).AddMinutes(50),
                Price = 35.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[2].Id,
                RoomId = rooms[2].Id,
                StartTime = date.AddHours(19).AddMinutes(30),
                EndTime = date.AddHours(22).AddMinutes(20),
                Price = 35.00m,
                Status = "Scheduled"
            });

            // Movie 4 & 5 in Room 4 (2D)
            showtimes.Add(new Showtime
            {
                MovieId = movies[4].Id,
                RoomId = rooms[3].Id,
                StartTime = date.AddHours(14).AddMinutes(0),
                EndTime = date.AddHours(15).AddMinutes(40),
                Price = 16.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[3].Id,
                RoomId = rooms[3].Id,
                StartTime = date.AddHours(16).AddMinutes(30),
                EndTime = date.AddHours(18).AddMinutes(40),
                Price = 18.00m,
                Status = "Scheduled"
            });
            showtimes.Add(new Showtime
            {
                MovieId = movies[3].Id,
                RoomId = rooms[3].Id,
                StartTime = date.AddHours(19).AddMinutes(15),
                EndTime = date.AddHours(21).AddMinutes(25),
                Price = 18.00m,
                Status = "Scheduled"
            });
        }

        context.Showtimes.AddRange(showtimes);
        await context.SaveChangesAsync();

        // 6. Pre-seed a few tickets and active reservations for testing the seat map
        var firstShowtime = showtimes[0];
        var room1Seats = seats.Where(s => s.RoomId == rooms[0].Id).OrderBy(s => s.Id).ToList();

        if (room1Seats.Count >= 6)
        {
            // Sold tickets
            var ticket1 = new Ticket
            {
                TicketCode = "TKT-INIT-001",
                ShowtimeId = firstShowtime.Id,
                SeatId = room1Seats[0].Id, // A-1
                UserId = users[0].Id,
                PricePaid = firstShowtime.Price,
                PaymentMethod = "CreditCard",
                TransactionId = "TXN-INIT-001",
                QrPayload = $"CINEPASS|TKT-INIT-001|SHOW:{firstShowtime.Id}|SEAT:{room1Seats[0].SeatCode}",
                Status = "Valid",
                PurchasedAt = DateTime.UtcNow.AddMinutes(-30)
            };

            var ticket2 = new Ticket
            {
                TicketCode = "TKT-INIT-002",
                ShowtimeId = firstShowtime.Id,
                SeatId = room1Seats[1].Id, // A-2
                UserId = users[0].Id,
                PricePaid = firstShowtime.Price,
                PaymentMethod = "CreditCard",
                TransactionId = "TXN-INIT-001",
                QrPayload = $"CINEPASS|TKT-INIT-002|SHOW:{firstShowtime.Id}|SEAT:{room1Seats[1].SeatCode}",
                Status = "Valid",
                PurchasedAt = DateTime.UtcNow.AddMinutes(-30)
            };

            context.Tickets.AddRange(ticket1, ticket2);

            // Active reservation for testing
            var res1 = new Reservation
            {
                ShowtimeId = firstShowtime.Id,
                SeatId = room1Seats[2].Id, // A-3
                UserId = users[1].Id,
                ReservationCode = "RES-INIT-001",
                ReservedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                Status = "Active"
            };

            context.Reservations.Add(res1);
            await context.SaveChangesAsync();
        }
    }
}
