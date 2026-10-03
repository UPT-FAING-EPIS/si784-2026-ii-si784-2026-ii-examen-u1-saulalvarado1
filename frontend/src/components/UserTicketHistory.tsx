import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { api } from '../services/api';
import { Ticket as TicketIcon, Calendar, Clock, Film, QrCode, Search } from 'lucide-react';

interface UserTicketHistoryProps {
  userId: number;
}

export const UserTicketHistory: React.FC<UserTicketHistoryProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        const data = await api.getUserTickets(userId);
        setTickets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void loadTickets();
  }, [userId]);

  const filtered = tickets.filter(t => 
    t.movieTitle.toLowerCase().includes(filterSearch.toLowerCase()) ||
    t.ticketCode.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <TicketIcon className="w-6 h-6 text-rose-500" />
            <span>Historial de Boletos Comprados</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consulta tus entradas emitidas, códigos QR de acceso y detalles de la función.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por película o código..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Cargando tus boletos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
          <TicketIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No tienes boletos registrados todavía</h3>
          <p className="text-slate-500 text-sm mt-1">Explora la cartelera y compra tus entradas para tus películas favoritas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(t => (
            <div
              key={t.ticketId || t.ticketCode}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-start space-x-4 hover:border-slate-700 transition-colors"
            >
              <div className="w-16 h-24 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={t.moviePosterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300"}
                  alt={t.movieTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-amber-400">
                    {t.ticketCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {t.status}
                  </span>
                </div>

                <h4 className="text-base font-black text-white truncate">{t.movieTitle}</h4>
                <p className="text-xs text-rose-400 font-semibold">{t.roomName} • Asiento {t.seatCode}</p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(t.startTime).toLocaleDateString('es-PE')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(t.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-2 bg-slate-950 rounded-xl border border-slate-800">
                <QrCode className="w-8 h-8 text-slate-300" />
                <span className="text-[9px] text-slate-500 mt-1 uppercase font-bold">QR</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
