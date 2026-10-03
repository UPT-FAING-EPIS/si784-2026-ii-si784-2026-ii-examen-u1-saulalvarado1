import React, { useState, useEffect, useCallback } from 'react';
import { Movie, Showtime, SeatLayout, PurchaseConfirmation } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { MovieBillboard } from './components/MovieBillboard';
import { SeatSelector } from './components/SeatSelector';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalTicket } from './components/DigitalTicket';
import { UserTicketHistory } from './components/UserTicketHistory';
import { AdminPanel } from './components/AdminPanel';

export function App() {
  const [activeTab, setActiveTab] = useState<'billboard' | 'tickets' | 'admin'>('billboard');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  // Seat selection & booking flow
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [pendingCheckoutSeats, setPendingCheckoutSeats] = useState<SeatLayout[]>([]);
  const [reservationCode, setReservationCode] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<PurchaseConfirmation | null>(null);

  // User context
  const currentUser = { id: 1, name: 'Carlos Mendoza', email: 'carlos.mendoza@epis.edu.pe' };

  const loadBillboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [mList, sList] = await Promise.all([
        api.getMovies(),
        api.getShowtimes(selectedDate)
      ]);
      setMovies(mList);
      setShowtimes(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadBillboardData();
  }, [loadBillboardData]);

  const handleSelectShowtime = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setConfirmation(null);
  };

  const handleProceedToCheckout = (showtime: Showtime, seats: SeatLayout[], resCode: string) => {
    setPendingCheckoutSeats(seats);
    setReservationCode(resCode);
    setIsCheckoutOpen(true);
  };

  const handlePurchaseSuccess = (conf: PurchaseConfirmation) => {
    setIsCheckoutOpen(false);
    setSelectedShowtime(null);
    setPendingCheckoutSeats([]);
    setReservationCode('');
    setConfirmation(conf);
    loadBillboardData();
  };

  const handleFinishTicketFlow = () => {
    setConfirmation(null);
    setActiveTab('tickets');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Outfit',sans-serif]">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedShowtime(null);
          setConfirmation(null);
        }}
        selectedUserName={currentUser.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {confirmation ? (
          <DigitalTicket
            confirmation={confirmation}
            onFinish={handleFinishTicketFlow}
          />
        ) : selectedShowtime ? (
          <SeatSelector
            showtime={selectedShowtime}
            onBack={() => setSelectedShowtime(null)}
            onProceedToCheckout={handleProceedToCheckout}
          />
        ) : (
          <>
            {activeTab === 'billboard' && (
              <MovieBillboard
                movies={movies}
                showtimes={showtimes}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onSelectShowtime={handleSelectShowtime}
              />
            )}

            {activeTab === 'tickets' && (
              <UserTicketHistory userId={currentUser.id} />
            )}

            {activeTab === 'admin' && (
              <AdminPanel onRefreshData={loadBillboardData} />
            )}
          </>
        )}
      </main>

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedShowtime && (
        <CheckoutModal
          showtime={selectedShowtime}
          selectedSeats={pendingCheckoutSeats}
          reservationCode={reservationCode}
          onClose={() => setIsCheckoutOpen(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            CinePass • Sistema de Venta de Boletos para Cine
          </p>
          <p>
            Desarrollado para SI-784 Ingeniería de Software II • Universidad Privada de Tacna (UPT FAING EPIS)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
