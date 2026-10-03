import React, { useState } from 'react';
import { Showtime, SeatLayout, PurchaseFormPayload, PurchaseConfirmation } from '../types';
import { api } from '../services/api';
import { CreditCard, QrCode, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  showtime: Showtime;
  selectedSeats: SeatLayout[];
  reservationCode: string;
  onClose: () => void;
  onPurchaseSuccess: (confirmation: PurchaseConfirmation) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  showtime,
  selectedSeats,
  reservationCode,
  onClose,
  onPurchaseSuccess
}) => {
  const [customerName, setCustomerName] = useState('Carlos Mendoza');
  const [customerEmail, setCustomerEmail] = useState('carlos.mendoza@epis.edu.pe');
  const [documentId, setDocumentId] = useState('72345678');
  const [paymentMethod, setPaymentMethod] = useState<'CreditCard' | 'Yape' | 'Plin'>('CreditCard');

  // Card fields
  const [cardNumber, setCardNumber] = useState('4557 1234 5678 9012');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      newErrors.customerName = 'Ingresa el nombre completo del comprador.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail)) {
      newErrors.customerEmail = 'Ingresa un correo electrónico válido.';
    }

    if (!documentId.trim() || !/^\d{8,12}$/.test(documentId.trim())) {
      newErrors.documentId = 'El documento (DNI) debe tener entre 8 y 12 dígitos.';
    }

    if (paymentMethod === 'CreditCard') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15 || cleanCard.length > 16) {
        newErrors.cardNumber = 'Número de tarjeta inválido (16 dígitos).';
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Fecha de expiración inválida (MM/AA).';
      }
      if (cardCvv.length < 3 || cardCvv.length > 4) {
        newErrors.cardCvv = 'CVV inválido (3 dígitos).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload: PurchaseFormPayload = {
        showtimeId: showtime.id,
        seatIds: selectedSeats.map(s => s.id),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        documentId: documentId.trim(),
        reservationCode,
        paymentMethod
      };

      const confirmation = await api.purchaseTickets(payload);
      onPurchaseSuccess(confirmation);
    } catch (err: any) {
      setErrors({ form: err.message || 'Error al procesar el pago. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-xl font-black text-white">Finalizar Compra de Boletos</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reserva: <span className="font-mono text-amber-400">{reservationCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {errors.form && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Purchase Summary Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>{showtime.movieTitle}</span>
              <span className="text-white">{showtime.roomName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Asientos: {selectedSeats.map(s => s.seatCode).join(', ')}</span>
              <span>{selectedSeats.length} entrada(s)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
              <span className="text-slate-200">Total a Pagar:</span>
              <span className="text-lg font-black text-emerald-400">S/ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos del Comprador
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className={`w-full bg-slate-950 border ${errors.customerName ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500`}
                placeholder="Ej. Juan Pérez"
              />
              {errors.customerName && <p className="text-[11px] text-rose-400 mt-1">{errors.customerName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.customerEmail ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500`}
                  placeholder="ejemplo@correo.com"
                />
                {errors.customerEmail && <p className="text-[11px] text-rose-400 mt-1">{errors.customerEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">DNI / Documento</label>
                <input
                  type="text"
                  maxLength={12}
                  value={documentId}
                  onChange={e => setDocumentId(e.target.value)}
                  className={`w-full bg-slate-950 border ${errors.documentId ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500`}
                  placeholder="8 dígitos"
                />
                {errors.documentId && <p className="text-[11px] text-rose-400 mt-1">{errors.documentId}</p>}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Método de Pago Seguro
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CreditCard')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'CreditCard'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-rose-400" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Yape')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'Yape'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-purple-400" />
                <span>Yape</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Plin')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                  paymentMethod === 'Plin'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-cyan-400" />
                <span>Plin</span>
              </button>
            </div>

            {/* Credit Card Inputs */}
            {paymentMethod === 'CreditCard' ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.cardNumber ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono`}
                    placeholder="4557 0000 0000 0000"
                  />
                  {errors.cardNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Vencimiento</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className={`w-full bg-slate-900 border ${errors.cardExpiry ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono`}
                      placeholder="MM/AA"
                    />
                    {errors.cardExpiry && <p className="text-[11px] text-rose-400 mt-1">{errors.cardExpiry}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className={`w-full bg-slate-900 border ${errors.cardCvv ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono`}
                      placeholder="123"
                    />
                    {errors.cardCvv && <p className="text-[11px] text-rose-400 mt-1">{errors.cardCvv}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Transfiere a través de <span className="font-bold text-white">{paymentMethod}</span> al número de CinePass:
                </p>
                <p className="text-lg font-mono font-black text-rose-400 tracking-wider">952 000 555</p>
                <p className="text-[11px] text-slate-500">La validación se realizará de forma automática al confirmar.</p>
              </div>
            )}
          </div>

          {/* Security Guarantee Note */}
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400/90 bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Transacción cifrada SSL de extremo a extremo sin almacenamiento de CVV.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-rose-950/60 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>Procesando pago seguro...</span>
            ) : (
              <span>Confirmar Compra (S/ {totalPrice.toFixed(2)})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
