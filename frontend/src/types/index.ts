export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  durationMinutes: number;
  posterUrl: string;
  rating: string;
  isActive: boolean;
}

export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string;
  movieDurationMinutes: number;
  movieGenre: string;
  movieRating: string;
  roomId: number;
  roomName: string;
  roomType: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  availableSeatsCount: number;
  totalSeatsCount: number;
}

export interface SeatLayout {
  id: number;
  roomId: number;
  rowCode: string;
  seatNumber: number;
  seatCode: string;
  seatType: 'Standard' | 'VIP' | string;
  status: 'Available' | 'Reserved' | 'Sold';
  price: number;
}

export interface ShowtimeSeatsResponse {
  showtimeId: number;
  movieTitle: string;
  roomName: string;
  roomType: string;
  rows: number;
  columns: number;
  startTime: string;
  basePrice: number;
  seats: SeatLayout[];
}

export interface ReservationResponse {
  reservationCode: string;
  showtimeId: number;
  reservedSeatIds: number[];
  reservedAt: string;
  expiresAt: string;
  secondsRemaining: number;
  status: string;
}

export interface Ticket {
  ticketId: number;
  ticketCode: string;
  showtimeId: number;
  movieTitle: string;
  moviePosterUrl: string;
  roomName: string;
  roomType: string;
  seatCode: string;
  seatType: string;
  startTime: string;
  pricePaid: number;
  paymentMethod: string;
  transactionId: string;
  qrPayload: string;
  status: string;
  purchasedAt: string;
  customerName: string;
  customerEmail: string;
}

export interface PurchaseConfirmation {
  transactionId: string;
  purchasedAt: string;
  totalPaid: number;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  tickets: Ticket[];
}

export interface PurchaseFormPayload {
  showtimeId: number;
  seatIds: number[];
  customerName: string;
  customerEmail: string;
  documentId: string;
  reservationCode?: string;
  paymentMethod: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  documentId: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  roomType: string;
  rows: number;
  columns: number;
}
