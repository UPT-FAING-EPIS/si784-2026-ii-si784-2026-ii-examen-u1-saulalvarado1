import React from 'react';
import { Film, Ticket as TicketIcon, Settings, UserCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'billboard' | 'tickets' | 'admin';
  setActiveTab: (tab: 'billboard' | 'tickets' | 'admin') => void;
  selectedUserName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedUserName
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <button 
          type="button"
          onClick={() => setActiveTab('billboard')}
          className="flex items-center space-x-3 text-left group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
              CINE<span className="text-rose-500">PASS</span>
            </span>
            <span className="block text-xs uppercase tracking-widest text-slate-400 font-medium">
              Venta de Boletos Online
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('billboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'billboard'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Cartelera</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'tickets'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>Mis Boletos</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Administración</span>
            <span className="sm:hidden">Admin</span>
          </button>
        </nav>

        {/* User Badge */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-800/50 py-1.5 px-3.5 rounded-full border border-slate-700/60">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{selectedUserName}</p>
            <p className="text-[10px] text-emerald-400 font-medium">Cliente Activo</p>
          </div>
        </div>
      </div>
    </header>
  );
};
