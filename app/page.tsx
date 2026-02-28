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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900">Eudora Babyrytmik</div>
              <div className="text-xs text-neutral-500">Anmälan till babysång</div>
            </div>
          </div>
          <a
            href="/admin/login"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-sm"
          >
            Admin Login
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
            Anmälan till babysång
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed">
            Vi ses på Södermalm torsdagar kl. 10.00–11.00 och på Gärdet tisdagar kl. 13.00–14.00. 
            Under samlingen sjunger vi gamla och nya sånger för och med barnen.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Förnamn
                </label>
                <input
                  type="text"
                  placeholder="Anna"
                  {...register('firstName', { required: 'Förnamn krävs' })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:shadow-lg transition-all bg-neutral-50 focus:bg-white"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-2">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Efternamn
                </label>
                <input
                  type="text"
                  placeholder="Jansdotter"
                  {...register('lastName', { required: 'Efternamn krävs' })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:shadow-lg transition-all bg-neutral-50 focus:bg-white"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-2">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
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
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:shadow-lg transition-all bg-neutral-50 focus:bg-white"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  placeholder="070 123 45 67"
                  {...register('phone', { required: 'Telefonnummer krävs' })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:shadow-lg transition-all bg-neutral-50 focus:bg-white"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-2">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                Välj plats
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setValue('location', 'sodermalm')}
                  className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
                    selectedLocation === 'sodermalm' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' 
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    value="sodermalm"
                    {...register('location', { required: 'Välj en plats' })}
                    className="sr-only"
                  />
                  <div className={`mb-1 ${
                    selectedLocation === 'sodermalm' ? 'font-semibold text-white' : 'font-medium text-neutral-900'
                  }`}>
                    Södermalm
                  </div>
                  <div className={`text-sm ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-200' : 'text-neutral-600'
                  }`}>
                    Torsdagar 10:00–11:00
                  </div>
                  <div className={`text-xs mt-2 ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}>
                    Fatburs Brunnsg 17
                  </div>
                </div>
                
                <div 
                  onClick={() => setValue('location', 'gardet')}
                  className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
                    selectedLocation === 'gardet' 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' 
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    value="gardet"
                    {...register('location', { required: 'Välj en plats' })}
                    className="sr-only"
                  />
                  <div className={`mb-1 ${
                    selectedLocation === 'gardet' ? 'font-semibold text-white' : 'font-medium text-neutral-900'
                  }`}>
                    Gärdet
                  </div>
                  <div className={`text-sm ${
                    selectedLocation === 'gardet' ? 'text-neutral-200' : 'text-neutral-600'
                  }`}>
                    Tisdagar 13:00–14:00
                  </div>
                  <div className={`text-xs mt-2 ${
                    selectedLocation === 'gardet' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}>
                    Sandhamnsg 7
                  </div>
                </div>
              </div>
              {errors.location && (
                <p className="text-red-600 text-sm mt-2">{errors.location.message}</p>
              )}
            </div>

            {/* Week Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Vecka
              </label>
              <input type="hidden" {...register('weekStart', { required: 'Välj en vecka' })} />
              <div ref={weekDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:shadow-lg transition-all bg-neutral-50 focus:bg-white text-left flex items-center justify-between"
                >
                  <span className={selectedWeek ? 'text-neutral-900' : 'text-neutral-500'}>
                    {selectedWeek 
                      ? `Vecka ${getWeekNumber(parseISO(selectedWeek))} (${formatWeekRange(parseISO(selectedWeek))})`
                      : 'Välj vecka'
                    }
                  </span>
                  <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${isWeekDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isWeekDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
                          className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                            isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-neutral-900'
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
                <p className="text-red-600 text-sm mt-2">{errors.weekStart.message}</p>
              )}
              {availableSpots !== null && selectedLocation && (
                <div className="mt-3 text-sm text-neutral-600">
                  {availableSpots > 0 ? (
                    <span>✓ {availableSpots} platser kvar</span>
                  ) : (
                    <span className="text-red-600">Fullbokad</span>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms', { required: 'Du måste godkänna villkoren' })}
                  className="w-5 h-5 text-primary focus:ring-primary border-neutral-300 rounded mt-0.5"
                />
                <span className="ml-3 text-sm text-neutral-600">
                  Jag godkänner <a href="#" className="text-primary hover:underline font-medium">villkoren</a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-600 text-sm mt-2">{errors.terms.message}</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-900 border-green-200' 
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || availableSpots === 0}
              className="w-full bg-neutral-900 text-white py-4 px-6 rounded-lg font-medium hover:bg-neutral-800 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Skickar...' : 'Skicka anmälan'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-neutral-500">
          © 2026 Eudora Babyrytmik. Alla rättigheter förbehållna.
        </div>
      </footer>
    </div>
  );
}
