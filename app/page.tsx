'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: 'sodermalm' | 'gardet';
  weekStart: string;
  terms: boolean;
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);
  const weekDropdownRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>();
  const { addRegistration, initializeWeeks, loadFromStorage, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedWeek = watch('weekStart');

  useEffect(() => {
    loadFromStorage();
    initializeWeeks();
  }, [loadFromStorage, initializeWeeks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(event.target as Node)) {
        setIsWeekDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableWeeks = getNext10Weeks().filter(week => {
    const weekKey = formatDate(week);
    return weekAvailability[weekKey]?.isAvailable !== false;
  });

  const getAvailableSpots = (weekStart: string, location: 'sodermalm' | 'gardet') => {
    if (!weekStart || !location) return 15;
    const registrations = getWeekRegistrations(weekStart, location);
    return 15 - registrations.length;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    const result = addRegistration({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      weekStart: data.weekStart,
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      reset();
    } else {
      setMessage({ type: 'error', text: result.message });
    }

    setIsSubmitting(false);
  };

  const availableSpots = selectedWeek && selectedLocation 
    ? getAvailableSpots(selectedWeek, selectedLocation)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-accent-light/10">
      {/* Header */}
      <header className="border-b border-neutral-200/50 bg-white/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-10 w-auto"
          />
          <a
            href="/admin/login"
            className="px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 rounded-full transition-all border border-neutral-200"
          >
            Admin
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-light/20 border border-accent-light/30 rounded-full text-sm font-medium text-neutral-900 mb-8">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            Anmälan öppen
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 tracking-tight leading-tight">
            Babysång
          </h1>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Södermalm torsdagar 10:00–11:00 • Gärdet tisdagar 13:00–14:00
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-3xl p-8 shadow-xl shadow-neutral-900/5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                  Förnamn
                </label>
                <input
                  type="text"
                  placeholder="Anna"
                  {...register('firstName', { required: 'Förnamn krävs' })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.firstName && (
                  <p className="text-error text-xs mt-1.5">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                  Efternamn
                </label>
                <input
                  type="text"
                  placeholder="Jansdotter"
                  {...register('lastName', { required: 'Efternamn krävs' })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.lastName && (
                  <p className="text-error text-xs mt-1.5">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                  E-post
                </label>
                <input
                  type="email"
                  placeholder="anna@example.com"
                  {...register('email', { 
                    required: 'E-post krävs',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ogiltig e-postadress'
                    }
                  })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.email && (
                  <p className="text-error text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                  Telefon
                </label>
                <input
                  type="tel"
                  placeholder="070 123 45 67"
                  {...register('phone', { required: 'Telefonnummer krävs' })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.phone && (
                  <p className="text-error text-xs mt-1.5">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-3 uppercase tracking-wide">
                Välj plats
              </label>
              <input type="hidden" {...register('location', { required: 'Välj en plats' })} />
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setValue('location', 'sodermalm')}
                  className={`cursor-pointer p-5 border rounded-2xl transition-all ${
                    selectedLocation === 'sodermalm' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg ring-2 ring-neutral-900/20' 
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    selectedLocation === 'sodermalm' ? 'text-white' : 'text-neutral-900'
                  }`}>
                    Södermalm
                  </div>
                  <div className={`text-xs mb-1 ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-300' : 'text-neutral-600'
                  }`}>
                    Torsdagar 10:00–11:00
                  </div>
                  <div className={`text-xs ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>
                    Fatburs Brunnsg 17
                  </div>
                </div>
                
                <div 
                  onClick={() => setValue('location', 'gardet')}
                  className={`cursor-pointer p-5 border rounded-2xl transition-all ${
                    selectedLocation === 'gardet' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg ring-2 ring-neutral-900/20' 
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    selectedLocation === 'gardet' ? 'text-white' : 'text-neutral-900'
                  }`}>
                    Gärdet
                  </div>
                  <div className={`text-xs mb-1 ${
                    selectedLocation === 'gardet' ? 'text-neutral-300' : 'text-neutral-600'
                  }`}>
                    Tisdagar 13:00–14:00
                  </div>
                  <div className={`text-xs ${
                    selectedLocation === 'gardet' ? 'text-neutral-400' : 'text-neutral-500'
                  }`}>
                    Sandhamnsg 7
                  </div>
                </div>
              </div>
              {errors.location && (
                <p className="text-error text-xs mt-1.5">{errors.location.message}</p>
              )}
            </div>

            {/* Week Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-2 uppercase tracking-wide">
                Vecka
              </label>
              <input type="hidden" {...register('weekStart', { required: 'Välj en vecka' })} />
              <div ref={weekDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white text-left flex items-center justify-between"
                >
                  <span className={selectedWeek ? 'text-neutral-900 text-sm' : 'text-neutral-500 text-sm'}>
                    {selectedWeek 
                      ? `Vecka ${getWeekNumber(parseISO(selectedWeek))} (${formatWeekRange(parseISO(selectedWeek))})`
                      : 'Välj vecka'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isWeekDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isWeekDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {availableWeeks.map(week => {
                      const weekKey = formatDate(week);
                      const weekNum = getWeekNumber(week);
                      const isSelected = selectedWeek === weekKey;
                      
                      return (
                        <button
                          key={weekKey}
                          type="button"
                          onClick={() => {
                            setValue('weekStart', weekKey);
                            setIsWeekDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            isSelected ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'text-neutral-900'
                          }`}
                        >
                          Vecka {weekNum} ({formatWeekRange(week)})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {errors.weekStart && (
                <p className="text-error text-xs mt-1.5">{errors.weekStart.message}</p>
              )}
              {availableSpots !== null && selectedLocation && (
                <div className="mt-2 flex items-center gap-2">
                  {availableSpots > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-neutral-600 font-medium">{availableSpots} platser kvar</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-error rounded-full"></div>
                      <span className="text-xs text-error font-medium">Fullbokad</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('terms', { required: 'Du måste godkänna villkoren' })}
                  className="w-4 h-4 text-neutral-900 focus:ring-2 focus:ring-neutral-900/20 border-neutral-300 rounded mt-0.5"
                />
                <span className="ml-3 text-xs text-neutral-600">
                  Jag godkänner <a href="#" className="text-neutral-900 hover:underline font-medium">villkoren</a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-error text-xs mt-1.5">{errors.terms.message}</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl border text-sm ${
                message.type === 'success' 
                  ? 'bg-accent-light/20 text-neutral-900 border-accent-light/30' 
                  : 'bg-error-light text-neutral-900 border-error/30'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || availableSpots === 0}
              className="w-full bg-neutral-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-neutral-800 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:shadow-neutral-900/20"
            >
              {isSubmitting ? 'Skickar...' : 'Skicka anmälan'}
            </button>
          </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/50 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-neutral-500">
          © 2026 Eudora Babyrytmik
        </div>
      </footer>
    </div>
  );
}
