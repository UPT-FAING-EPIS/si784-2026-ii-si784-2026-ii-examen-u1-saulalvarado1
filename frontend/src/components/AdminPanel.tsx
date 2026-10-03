import React, { useState, useEffect } from 'react';
import { Movie, Room } from '../types';
import { api } from '../services/api';
import { PlusCircle, Film, Tv, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'showtime' | 'movie'>('showtime');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Showtime
  const [showtimeMovieId, setShowtimeMovieId] = useState<number>(1);
  const [showtimeRoomId, setShowtimeRoomId] = useState<number>(1);
  const [showtimeDate, setShowtimeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showtimeTime, setShowtimeTime] = useState<string>('20:00');
  const [showtimePrice, setShowtimePrice] = useState<number>(25.00);

  // Form Movie
  const [movieTitle, setMovieTitle] = useState('');
  const [movieSynopsis, setMovieSynopsis] = useState('');
  const [movieGenre, setMovieGenre] = useState('Acción / Aventura');
  const [movieDuration, setMovieDuration] = useState(120);
  const [moviePoster, setMoviePoster] = useState('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600');
  const [movieRating, setMovieRating] = useState('PG-13');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mList, rList] = await Promise.all([api.getMovies(), api.getRooms()]);
        setMovies(mList);
        setRooms(rList);
        if (mList.length > 0) setShowtimeMovieId(mList[0].id);
        if (rList.length > 0) setShowtimeRoomId(rList[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const fullStartTime = `${showtimeDate}T${showtimeTime}:00Z`;
      await api.createShowtime({
        movieId: Number(showtimeMovieId),
        roomId: Number(showtimeRoomId),
        startTime: fullStartTime,
        price: Number(showtimePrice)
      });

      setSuccessMsg('¡Función programada exitosamente en la cartelera!');
      onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al programar función.');
    }
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!movieTitle.trim()) {
      setErrorMsg('El título de la película es obligatorio.');
      return;
    }

    try {
      await api.createMovie({
        title: movieTitle,
        synopsis: movieSynopsis,
        genre: movieGenre,
        durationMinutes: Number(movieDuration),
        posterUrl: moviePoster,
        rating: movieRating
      });

      setSuccessMsg('¡Película registrada con éxito en el catálogo!');
      setMovieTitle('');
      setMovieSynopsis('');
      onRefreshData();
      const updatedMovies = await api.getMovies();
      setMovies(updatedMovies);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar película.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Panel de Administración de CinePass</h2>
        <p className="text-xs text-slate-400 mt-1">
          Gestiona el catálogo de películas, salas de exhibición y programa funciones semanales.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => { setActiveTab('showtime'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'showtime'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Programar Función</span>
        </button>

        <button
          onClick={() => { setActiveTab('movie'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'movie'
              ? 'bg-rose-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Registrar Película</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab: Program Showtime */}
      {activeTab === 'showtime' && (
        <form onSubmit={handleCreateShowtime} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-rose-500" />
            <span>Nueva Programación de Función</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Película</label>
              <select
                value={showtimeMovieId}
                onChange={e => setShowtimeMovieId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {movies.map(m => (
                  <option key={m.id} value={m.id}>{m.title} ({m.durationMinutes} min)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sala</label>
              <select
                value={showtimeRoomId}
                onChange={e => setShowtimeRoomId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.roomType} - {r.capacity} butacas)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Fecha</label>
              <input
                type="date"
                value={showtimeDate}
                onChange={e => setShowtimeDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hora de Inicio</label>
              <input
                type="time"
                value={showtimeTime}
                onChange={e => setShowtimeTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Precio Base Entrada (S/)</label>
              <input
                type="number"
                step="0.50"
                min="5"
                max="100"
                value={showtimePrice}
                onChange={e => setShowtimePrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-colors"
          >
            Publicar Función en Cartelera
          </button>
        </form>
      )}

      {/* Tab: Register Movie */}
      {activeTab === 'movie' && (
        <form onSubmit={handleCreateMovie} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Film className="w-4 h-4 text-rose-500" />
            <span>Registrar Nueva Película en Cartelera</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Título de la Película</label>
              <input
                type="text"
                value={movieTitle}
                onChange={e => setMovieTitle(e.target.value)}
                placeholder="Ej. Avatar 3: Fire and Ash"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sinopsis</label>
              <textarea
                rows={3}
                value={movieSynopsis}
                onChange={e => setMovieSynopsis(e.target.value)}
                placeholder="Breve resumen del argumento..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Género</label>
                <input
                  type="text"
                  value={movieGenre}
                  onChange={e => setMovieGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={movieDuration}
                  onChange={e => setMovieDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Clasificación</label>
                <select
                  value={movieRating}
                  onChange={e => setMovieRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="G">G (Todo Público)</option>
                  <option value="PG">PG (Guía Paternal)</option>
                  <option value="PG-13">PG-13 (+13 Años)</option>
                  <option value="R">R (Restringido / Adultos)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">URL de Imagen Póster</label>
              <input
                type="url"
                value={moviePoster}
                onChange={e => setMoviePoster(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-colors"
          >
            Guardar Película en Sistema
          </button>
        </form>
      )}
    </div>
  );
};
