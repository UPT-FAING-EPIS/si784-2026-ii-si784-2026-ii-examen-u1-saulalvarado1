import React, { useState, useEffect } from 'react';
import { Showtime, ShowtimeSeatsResponse, SeatLayout } from '../types';
import { api } from '../services/api';
import { ArrowLeft, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface SeatSelectorProps {
  showtime: Showtime;
  onBack: () => void;
  onProceedToCheckout: (showtime: Showtime, selectedSeats: SeatLayout[], reservationCode: string) => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  showtime,
  onBack,
  onProceedToCheckout
}) => {
  const [loading, setLoading] = useState(true);
  const [seatData, setSeatData] = useState<ShowtimeSeatsResponse | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [reservationCode, setReservationCode] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 min hold
  const [isReserving, setIsReserving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load seats
  useEffect(() => {
    let isMounted = true;
    async function fetchSeats() {
      try {
        setLoading(true);
        const data = await api.getShowtimeSeats(showtime.id);
        if (isMounted) {
          setSeatData(data);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg('Error al cargar la distribución de la sala.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSeats();
    return () => { isMounted = false; };
  }, [showtime.id]);

  // Countdown timer for 5-minute reservation
  useEffect(() => {
    if (!reservationCode || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Tu reserva temporal de 5 minutos ha expirado. Por favor, selecciona nuevamente tus asientos.');
          setSelectedSeatIds([]);
          setReservationCode('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reservationCode, secondsRemaining]);

  const toggleSeatSelection = (seat: SeatLayout) => {
    if (seat.status !== 'Available') return;

    setErrorMsg(null);
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('Puedes seleccionar un máximo de 8 asientos por compra.');
        return;
      }
      setSelectedSeatIds(prev => [...prev, seat.id]);
    }
  };

  const selectedSeatsList = seatData?.seats.filter(s => selectedSeatIds.includes(s.id)) || [];
  const totalPrice = selectedSeatsList.reduce((acc, s) => acc + s.price, 0);

  const handleHoldReservation = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMsg('Por favor selecciona al menos un asiento.');
      return;
    }

    try {
      setIsReserving(true);
      setErrorMsg(null);
      const res = await api.reserveSeats(showtime.id, selectedSeatIds);
      setReservationCode(res.reservationCode);
      setSecondsRemaining(res.secondsRemaining || 300);
      onProceedToCheckout(showtime, selectedSeatsList, res.reservationCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'No fue posible reservar los asientos. Intenta con otros.');
    } finally {
      setIsReserving(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group seats by row
  const rowsMap = seatData?.seats.reduce((acc, seat) => {
    if (!acc[seat.rowCode]) acc[seat.rowCode] = [];
    acc[seat.rowCode].push(seat);
    return acc;
  }, {} as Record<string, SeatLayout[]>) || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la cartelera</span>
        </button>

        <div className="text-left sm:text-right">
          <h2 className="text-xl font-black text-white">{showtime.movieTitle}</h2>
          <p className="text-xs text-slate-400">
            {showtime.roomName} • {new Date(showtime.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} • S/ {showtime.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Reservation Timer Notification (if active) */}
      {reservationCode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-300">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <p className="text-sm font-bold">Asientos bloqueados temporalmente ({reservationCode})</p>
              <p className="text-xs text-amber-400/80">Regla de negocio: los asientos se liberarán si no confirmas la compra en 5 minutos.</p>
            </div>
          </div>
          <span className="text-xl font-black font-mono text-amber-300 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-500/40">
            {formatTimer(secondsRemaining)}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center space-x-3 text-rose-300 text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Theater Screen & Seat Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Cinema Screen Curve */}
        <div className="relative mb-12 flex flex-col items-center">
          <div className="w-3/4 h-2 bg-gradient-to-r from-rose-500 via-white to-rose-500 rounded-full shadow-[0_0_25px_rgba(244,63,94,0.6)]"></div>
          <div className="w-4/5 h-8 bg-gradient-to-b from-rose-500/10 to-transparent clip-path-trapezoid pointer-events-none"></div>
          <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-slate-400 mt-2">
            PANTALLA
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Cargando distribución de sala...</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto overflow-x-auto pb-4">
            {Object.entries(rowsMap).map(([rowCode, seatsInRow]) => (
              <div key={rowCode} className="flex items-center justify-center space-x-2 sm:space-x-3">
                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowCode}</span>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {seatsInRow.map(seat => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isSold = seat.status === 'Sold';
                    const isReserved = seat.status === 'Reserved';
                    const isVip = seat.seatType === 'VIP';

                    let seatBg = 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'; // Standard available
                    if (isVip && !isSelected && !isSold && !isReserved) {
                      seatBg = 'bg-indigo-950/70 hover:bg-indigo-900 border-indigo-700/60 text-indigo-300';
                    }
                    if (isSelected) {
                      seatBg = 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950 scale-105';
                    } else if (isReserved) {
                      seatBg = 'bg-amber-900/60 border-amber-700/60 text-amber-400 cursor-not-allowed';
                    } else if (isSold) {
                      seatBg = 'bg-slate-900 border-slate-900 text-slate-600 cursor-not-allowed opacity-50';
                    }

                    return (
                      <button
                        key={seat.id}
                        disabled={isSold || isReserved}
                        onClick={() => toggleSeatSelection(seat)}
                        title={`${seat.seatCode} (${seat.seatType}) - S/ ${seat.price.toFixed(2)} - ${seat.status}`}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center justify-center ${seatBg}`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="w-6 text-center text-xs font-bold text-slate-400">{rowCode}</span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700"></div>
            <span>Estándar</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-indigo-950 border border-indigo-700"></div>
            <span>VIP (+S/ 5.00)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-rose-600 border border-rose-500"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-amber-900/60 border border-amber-700"></div>
            <span>Reservado (5 min)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-900 opacity-50"></div>
            <span>Ocupado</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Asientos Seleccionados:</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {selectedSeatsList.length === 0 ? (
              <span className="text-sm text-slate-500">Ningún asiento seleccionado</span>
            ) : (
              selectedSeatsList.map(s => (
                <span
                  key={s.id}
                  className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
                >
                  {s.seatCode} ({s.seatType})
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total a Pagar:</p>
            <p className="text-2xl font-black text-emerald-400">S/ {totalPrice.toFixed(2)}</p>
          </div>

          <button
            disabled={selectedSeatsList.length === 0 || isReserving}
            onClick={handleHoldReservation}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-rose-950/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isReserving ? (
              <span>Bloqueando...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Continuar a Pago</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
