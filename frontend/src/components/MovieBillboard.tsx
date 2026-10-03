import React, { useState, useMemo } from 'react';
import { Showtime, Movie } from '../types';
import { Calendar, Clock, Film, Search, Sparkles, Tv } from 'lucide-react';

interface MovieBillboardProps {
  movies: Movie[];
  showtimes: Showtime[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onSelectShowtime: (showtime: Showtime) => void;
}

export const MovieBillboard: React.FC<MovieBillboardProps> = ({
  movies,
  showtimes,
  selectedDate,
  setSelectedDate,
  onSelectShowtime
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [selectedRoomType, setSelectedRoomType] = useState('Todos');

  // Generate 7 days starting today
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-PE', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('es-PE', { month: 'short' });
      days.push({ iso, dayName, dayNum, monthName });
    }
    return days;
  }, []);

  // Unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => {
      m.genre.split('/').forEach(g => set.add(g.trim()));
    });
    return ['Todos', ...Array.from(set)];
  }, [movies]);

  // Unique room types
  const roomTypes = ['Todos', '2D', '3D', 'IMAX', 'VIP'];

  // Filter showtimes
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => {
      const matchSearch = s.movieTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGenre = selectedGenre === 'Todos' || s.movieGenre.toLowerCase().includes(selectedGenre.toLowerCase());
      const matchRoom = selectedRoomType === 'Todos' || s.roomType.toLowerCase() === selectedRoomType.toLowerCase();
      return matchSearch && matchGenre && matchRoom;
    });
  }, [showtimes, searchTerm, selectedGenre, selectedRoomType]);

  // Group showtimes by movie
  const showtimesByMovie = useMemo(() => {
    const map = new Map<number, { movie: Partial<Movie>; list: Showtime[] }>();

    filteredShowtimes.forEach(s => {
      if (!map.has(s.movieId)) {
        map.set(s.movieId, {
          movie: {
            id: s.movieId,
            title: s.movieTitle,
            posterUrl: s.moviePosterUrl,
            durationMinutes: s.movieDurationMinutes,
            genre: s.movieGenre,
            rating: s.movieRating,
          },
          list: []
        });
      }
      map.get(s.movieId)!.list.push(s);
    });

    return Array.from(map.values());
  }, [filteredShowtimes]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Cartelera Semanal Exclusiva</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Tus Películas Favoritas en la Mejor Pantalla
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Consulta horarios semanales, reserva asientos en tiempo real con 5 minutos de bloqueo y disfruta de una experiencia cinematográfica de primer nivel.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-12 translate-y-8">
          <Film className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-300">
          <Calendar className="w-4 h-4 text-rose-400" />
          <span>Selecciona el día de la función:</span>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {weekDays.map(day => {
            const isSelected = selectedDate === day.iso;
            return (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60 scale-105'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] uppercase font-bold tracking-wider">{day.dayName}</span>
                <span className="text-2xl font-black mt-0.5">{day.dayNum}</span>
                <span className="text-[10px] uppercase font-medium">{day.monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por película..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Género:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Room Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Sala:</span>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {roomTypes.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movies & Showtimes Grid */}
      {showtimesByMovie.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No se encontraron funciones disponibles</h3>
          <p className="text-slate-500 text-sm mt-1">Prueba seleccionando otro día o ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {showtimesByMovie.map(({ movie, list }) => (
            <div
              key={movie.id}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl hover:border-slate-700/80 transition-all duration-200 flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Poster */}
              <div className="w-full md:w-44 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg border border-slate-800">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-64 md:h-60 object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Movie Details & Schedules */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
                      {movie.rating}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {movie.genre}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="flex items-center text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {movie.durationMinutes} min
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white hover:text-rose-400 transition-colors">
                    {movie.title}
                  </h2>
                </div>

                {/* Showtimes Chips */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                      Horarios Disponibles:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Haz clic en un horario para seleccionar asientos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                    {list.map(showtime => {
                      const timeStr = new Date(showtime.startTime).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const isAlmostFull = showtime.availableSeatsCount <= 5;

                      return (
                        <button
                          key={showtime.id}
                          onClick={() => onSelectShowtime(showtime)}
                          className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500 hover:bg-rose-950/30 transition-all duration-200 text-center"
                        >
                          <span className="text-lg font-black text-slate-100 group-hover:text-rose-400 transition-colors">
                            {timeStr}
                          </span>
                          <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400 font-medium">
                            <Tv className="w-3 h-3 text-indigo-400" />
                            <span>{showtime.roomType}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">S/ {showtime.price.toFixed(2)}</span>
                          </div>

                          <div className="mt-1 text-[10px]">
                            {isAlmostFull ? (
                              <span className="text-amber-400 font-bold">¡Últimos {showtime.availableSeatsCount} asientos!</span>
                            ) : (
                              <span className="text-slate-500">{showtime.availableSeatsCount} disponibles</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
