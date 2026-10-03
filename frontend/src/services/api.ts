import {
  Movie,
  Showtime,
  ShowtimeSeatsResponse,
  ReservationResponse,
  PurchaseConfirmation,
  PurchaseFormPayload,
  Ticket,
  Room
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Fallback Mock Data in case Backend API is not started locally
const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Gladiator II",
    synopsis: "Años después de presenciar la muerte del admirado héroe Máximo a manos de su tío, Lucio debe entrar en el Coliseo tras ser testigo de la conquista de su hogar.",
    genre: "Acción / Épico",
    durationMinutes: 148,
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    rating: "R",
    isActive: true
  },
  {
    id: 2,
    title: "Wicked",
    synopsis: "La historia no contada de las brujas de Oz: Elphaba, una joven incomprendida debido a su piel verde, y Glinda, una joven popular dorada por el privilegio.",
    genre: "Musical / Fantasía",
    durationMinutes: 160,
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    rating: "PG",
    isActive: true
  },
  {
    id: 3,
    title: "Dune: Parte Dos",
    synopsis: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    genre: "Ciencia Ficción / Aventura",
    durationMinutes: 166,
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80",
    rating: "PG-13",
    isActive: true
  },
  {
    id: 4,
    title: "Deadpool & Wolverine",
    synopsis: "Un apático Wade Wilson se afana en la vida civil dejando atrás sus días como Deadpool. Pero cuando su mundo natal se enfrenta a una amenaza, debe vestir el traje.",
    genre: "Acción / Comedia",
    durationMinutes: 128,
    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    rating: "R",
    isActive: true
  }
];

export const api = {
  async getMovies(): Promise<Movie[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      return MOCK_MOVIES;
    }
  },

  async getShowtimes(date?: string, time?: string, movieId?: number, roomId?: number): Promise<Showtime[]> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (time) params.append('time', time);
      if (movieId) params.append('movieId', movieId.toString());
      if (roomId) params.append('roomId', roomId.toString());

      const res = await fetch(`${API_BASE_URL}/showtimes?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      // Mock showtimes for the selected date
      const today = new Date();
      return [
        {
          id: 1,
          movieId: 1,
          movieTitle: "Gladiator II",
          moviePosterUrl: MOCK_MOVIES[0].posterUrl,
          movieDurationMinutes: 148,
          movieGenre: "Acción / Épico",
          movieRating: "R",
          roomId: 1,
          roomName: "Sala 1 - IMAX Laser",
          roomType: "IMAX",
          startTime: `${date || today.toISOString().split('T')[0]}T15:00:00Z`,
          endTime: `${date || today.toISOString().split('T')[0]}T17:30:00Z`,
          price: 25.00,
          status: "Scheduled",
          availableSeatsCount: 45,
          totalSeatsCount: 48
        },
        {
          id: 2,
          movieId: 1,
          movieTitle: "Gladiator II",
          moviePosterUrl: MOCK_MOVIES[0].posterUrl,
          movieDurationMinutes: 148,
          movieGenre: "Acción / Épico",
          movieRating: "R",
          roomId: 1,
          roomName: "Sala 1 - IMAX Laser",
          roomType: "IMAX",
          startTime: `${date || today.toISOString().split('T')[0]}T18:30:00Z`,
          endTime: `${date || today.toISOString().split('T')[0]}T21:00:00Z`,
          price: 28.00,
          status: "Scheduled",
          availableSeatsCount: 42,
          totalSeatsCount: 48
        },
        {
          id: 3,
          movieId: 2,
          movieTitle: "Wicked",
          moviePosterUrl: MOCK_MOVIES[1].posterUrl,
          movieDurationMinutes: 160,
          movieGenre: "Musical / Fantasía",
          movieRating: "PG",
          roomId: 2,
          roomName: "Sala 2 - Dolby Atmos 3D",
          roomType: "3D",
          startTime: `${date || today.toISOString().split('T')[0]}T16:00:00Z`,
          endTime: `${date || today.toISOString().split('T')[0]}T18:45:00Z`,
          price: 22.00,
          status: "Scheduled",
          availableSeatsCount: 40,
          totalSeatsCount: 48
        },
        {
          id: 4,
          movieId: 3,
          movieTitle: "Dune: Parte Dos",
          moviePosterUrl: MOCK_MOVIES[2].posterUrl,
          movieDurationMinutes: 166,
          movieGenre: "Ciencia Ficción / Aventura",
          movieRating: "PG-13",
          roomId: 3,
          roomName: "Sala 3 - VIP Lounge",
          roomType: "VIP",
          startTime: `${date || today.toISOString().split('T')[0]}T19:00:00Z`,
          endTime: `${date || today.toISOString().split('T')[0]}T21:45:00Z`,
          price: 35.00,
          status: "Scheduled",
          availableSeatsCount: 28,
          totalSeatsCount: 32
        }
      ];
    }
  },

  async getShowtimeSeats(showtimeId: number): Promise<ShowtimeSeatsResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/showtimes/${showtimeId}/seats`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      // Mock seat layout: 6 rows (A to F), 8 columns
      const seats = [];
      let idCounter = 1;
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

      for (const row of rows) {
        const isVip = row === 'E' || row === 'F';
        for (let col = 1; col <= 8; col++) {
          let status: 'Available' | 'Reserved' | 'Sold' = 'Available';
          if (row === 'A' && (col === 1 || col === 2)) status = 'Sold';
          if (row === 'B' && col === 4) status = 'Reserved';

          seats.push({
            id: idCounter++,
            roomId: 1,
            rowCode: row,
            seatNumber: col,
            seatCode: `${row}-${col}`,
            seatType: isVip ? 'VIP' : 'Standard',
            status,
            price: isVip ? 30.00 : 25.00
          });
        }
      }

      return {
        showtimeId,
        movieTitle: "Gladiator II",
        roomName: "Sala 1 - IMAX Laser",
        roomType: "IMAX",
        rows: 6,
        columns: 8,
        startTime: new Date().toISOString(),
        basePrice: 25.00,
        seats
      };
    }
  },

  async reserveSeats(showtimeId: number, seatIds: number[], userId?: number): Promise<ReservationResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showtimeId, seatIds, userId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || error.message || 'Error al reservar asientos');
      }
      return await res.json();
    } catch (err: any) {
      // Fallback response for offline demo
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60000);
      const randomBytes = new Uint8Array(4);
      globalThis.crypto.getRandomValues(randomBytes);
      const codeSuffix = Array.from(randomBytes, b => (b % 36).toString(36)).join('').toUpperCase();
      return {
        reservationCode: `RES-${codeSuffix}`,
        showtimeId,
        reservedSeatIds: seatIds,
        reservedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        secondsRemaining: 300,
        status: "Active"
      };
    }
  },

  async purchaseTickets(payload: PurchaseFormPayload): Promise<PurchaseConfirmation> {
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || error.message || 'Error al procesar la compra');
      }
      return await res.json();
    } catch (err: any) {
      // Fallback confirmation
      const now = new Date().toISOString();
      const txnId = `TXN-${Date.now().toString().slice(-8)}`;
      const ticketRandoms = new Uint32Array(payload.seatIds.length * 2);
      globalThis.crypto.getRandomValues(ticketRandoms);
      const tickets: Ticket[] = payload.seatIds.map((seatId, idx) => ({
        ticketId: (ticketRandoms[idx * 2] % 1000) + 1,
        ticketCode: `TKT-${(ticketRandoms[idx * 2 + 1] % 1679616).toString(36).padStart(4, '0').toUpperCase()}`,
        showtimeId: payload.showtimeId,
        movieTitle: "Gladiator II",
        moviePosterUrl: MOCK_MOVIES[0].posterUrl,
        roomName: "Sala 1 - IMAX Laser",
        roomType: "IMAX",
        seatCode: `A-${idx + 3}`,
        seatType: "Standard",
        startTime: now,
        pricePaid: 25.00,
        paymentMethod: payload.paymentMethod,
        transactionId: txnId,
        qrPayload: `CINEPASS|${txnId}|SEAT:A-${idx + 3}`,
        status: "Valid",
        purchasedAt: now,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail
      }));

      return {
        transactionId: txnId,
        purchasedAt: now,
        totalPaid: tickets.reduce((acc, t) => acc + t.pricePaid, 0),
        paymentMethod: payload.paymentMethod,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        tickets
      };
    }
  },

  async getUserTickets(userId: number): Promise<Ticket[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/tickets`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      return [
        {
          ticketId: 101,
          ticketCode: "TKT-CP89412A",
          showtimeId: 1,
          movieTitle: "Gladiator II",
          moviePosterUrl: MOCK_MOVIES[0].posterUrl,
          roomName: "Sala 1 - IMAX Laser",
          roomType: "IMAX",
          seatCode: "C-4",
          seatType: "Standard",
          startTime: new Date().toISOString(),
          pricePaid: 25.00,
          paymentMethod: "CreditCard",
          transactionId: "TXN-8941203",
          qrPayload: "CINEPASS|TKT-CP89412A|C-4",
          status: "Valid",
          purchasedAt: new Date(Date.now() - 3600000).toISOString(),
          customerName: "Carlos Mendoza",
          customerEmail: "carlos.mendoza@epis.edu.pe"
        }
      ];
    }
  },

  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      return [
        { id: 1, name: "Sala 1 - IMAX Laser", capacity: 48, roomType: "IMAX", rows: 6, columns: 8 },
        { id: 2, name: "Sala 2 - Dolby Atmos 3D", capacity: 48, roomType: "3D", rows: 6, columns: 8 },
        { id: 3, name: "Sala 3 - VIP Lounge", capacity: 32, roomType: "VIP", rows: 4, columns: 8 }
      ];
    }
  },

  async createMovie(data: Partial<Movie>): Promise<Movie> {
    const res = await fetch(`${API_BASE_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al registrar película');
    return await res.json();
  },

  async createShowtime(data: any): Promise<Showtime> {
    const res = await fetch(`${API_BASE_URL}/showtimes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al registrar función');
    }
    return await res.json();
  }
};
