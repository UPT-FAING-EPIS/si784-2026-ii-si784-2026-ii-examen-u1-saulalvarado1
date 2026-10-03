import React from 'react';
import { PurchaseConfirmation } from '../types';
import { CheckCircle, Download, Printer, ArrowRight, Film, MapPin, Calendar, Clock, QrCode } from 'lucide-react';

interface DigitalTicketProps {
  confirmation: PurchaseConfirmation;
  onFinish: () => void;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({
  confirmation,
  onFinish
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white">¡Compra Confirmada con Éxito!</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Tus boletos digitales han sido emitidos. Presenta este comprobante o el código QR al ingresar a la sala.
        </p>
      </div>

      {/* Tickets List */}
      <div className="space-y-6">
        {confirmation.tickets.map((ticket, index) => (
          <div
            key={ticket.ticketCode}
            className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left Movie Info Stub */}
            <div className="p-6 md:p-8 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                  CinePass Boleto #{index + 1}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {ticket.ticketCode}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">{ticket.movieTitle}</h3>
                <p className="text-xs text-rose-400 font-semibold mt-0.5">{ticket.roomName} ({ticket.roomType})</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-slate-800/80 text-xs">
                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Fecha</span>
                  <div className="flex items-center space-x-1 font-semibold text-slate-200 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>{new Date(ticket.startTime).toLocaleDateString('es-PE')}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Hora</span>
                  <div className="flex items-center space-x-1 font-semibold text-slate-200 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>{new Date(ticket.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-slate-500 text-[10px] uppercase font-bold">Asiento</span>
                  <span className="text-base font-black text-amber-400 mt-0.5 block">
                    {ticket.seatCode} <span className="text-xs font-medium text-slate-400">({ticket.seatType})</span>
                  </span>
                </div>
              </div>

              {/* Buyer & Payment Meta */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Cliente: <strong className="text-slate-300">{ticket.customerName}</strong></span>
                <span>Pago: <strong className="text-slate-300">{ticket.paymentMethod}</strong> (S/ {ticket.pricePaid.toFixed(2)})</span>
              </div>
            </div>

            {/* Perforated Divider (visual notches) */}
            <div className="hidden md:flex flex-col justify-between items-center py-4 relative">
              <div className="w-5 h-5 bg-slate-950 rounded-full -mt-6 border-b border-slate-800"></div>
              <div className="h-full border-r-2 border-dashed border-slate-800"></div>
              <div className="w-5 h-5 bg-slate-950 rounded-full -mb-6 border-t border-slate-800"></div>
            </div>

            {/* Right QR Stub */}
            <div className="bg-slate-950/80 p-6 md:p-8 md:w-56 flex flex-col items-center justify-center text-center space-y-3 border-t md:border-t-0 md:border-l border-slate-800">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200">
                {/* Visual QR representation */}
                <div className="w-28 h-28 bg-slate-100 flex flex-col items-center justify-center p-1 rounded-lg">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Validar en Sala</p>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-[140px] mt-0.5">
                  {ticket.transactionId}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Boletos</span>
        </button>

        <button
          onClick={onFinish}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all w-full sm:w-auto justify-center"
        >
          <span>Volver a la Cartelera</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
