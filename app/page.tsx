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
  const { addRegistration, initializeWeeks, loadFromDatabase, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedWeek = watch('weekStart');

  useEffect(() => {
    loadFromDatabase();
    initializeWeeks();
  }, [loadFromDatabase, initializeWeeks]);

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

    const result = await addRegistration({
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
    <div className="min-h-screen bg-[#F5F3EA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-8 sm:h-10 w-auto"
          />
          <a
            href="/admin/login"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all border border-neutral-300"
          >
            Admin
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-light/30 rounded-full text-xs font-medium text-neutral-900 mb-4">
            15 platser tillgängliga per vecka
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Anmälan till babysång
          </h1>
          <p className="text-sm sm:text-base text-neutral-900 leading-relaxed">
            Vi ses på <strong>Södermalm (Fatburs Brunns gata 17) torsdagar kl. 10.00–11.00</strong> och på <strong>Gärdet (Sehellegatan 7) torsdagar kl. 13.00–14.00</strong>. Under samlingen sjunger vi gamla och nya sånger för och med barnen på svenska och engelska. Vi använder rörelse, spelar rytminstrument och lyssnar på musik. Anmäl ditt barn nedan:
          </p>
        </div>

        {/* Form Section */}
        <div>
          <div className="bg-white border border-neutral-300 rounded-xl p-4 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Förnamn/First Name
                </label>
                <input
                  type="text"
                  placeholder="Ex. Anna"
                  {...register('firstName', { required: 'Förnamn krävs' })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.firstName && (
                  <p className="text-error text-xs mt-1.5">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Efternamn/Last Name
                </label>
                <input
                  type="text"
                  placeholder="Ex. Jakobsson"
                  {...register('lastName', { required: 'Efternamn krävs' })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.lastName && (
                  <p className="text-error text-xs mt-1.5">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  E-post/Email
                </label>
                <input
                  type="email"
                  placeholder="Ex. anna@jakobsson.se"
                  {...register('email', { 
                    required: 'E-post krävs',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ogiltig e-postadress'
                    }
                  })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.email && (
                  <p className="text-error text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Mobilnummer/Phone
                </label>
                <input
                  type="tel"
                  placeholder="Ex. anna@jakobsson.se"
                  {...register('phone', { required: 'Telefonnummer krävs' })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all bg-white"
                />
                {errors.phone && (
                  <p className="text-error text-xs mt-1.5">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                Vilken förskola vill du anmäla dig till?
              </label>
              <input type="hidden" {...register('location', { required: 'Välj en plats' })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setValue('location', 'sodermalm')}
                  className={`cursor-pointer p-4 sm:p-6 border-2 rounded-xl transition-all ${
                    selectedLocation === 'sodermalm' 
                      ? 'border-neutral-900 bg-neutral-900 text-white' 
                      : 'border-neutral-300 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className={`text-lg font-bold mb-2 ${
                    selectedLocation === 'sodermalm' ? 'text-white' : 'text-neutral-900'
                  }`}>
                    Södermalm
                  </div>
                  <div className={`text-sm mb-2 ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-200' : 'text-neutral-700'
                  }`}>
                    Torsdagar 10:00–11:00
                  </div>
                  <div className={`text-xs ${
                    selectedLocation === 'sodermalm' ? 'text-neutral-300' : 'text-neutral-500'
                  }`}>
                    Fatburs Brunnsg 17
                  </div>
                </div>
                
                <div 
                  onClick={() => setValue('location', 'gardet')}
                  className={`cursor-pointer p-6 border-2 rounded-xl transition-all ${
                    selectedLocation === 'gardet' 
                      ? 'border-neutral-900 bg-neutral-900 text-white' 
                      : 'border-neutral-300 hover:border-neutral-400 bg-white'
                  }`}
                >
                  <div className={`text-lg font-bold mb-2 ${
                    selectedLocation === 'gardet' ? 'text-white' : 'text-neutral-900'
                  }`}>
                    Gärdet
                  </div>
                  <div className={`text-sm mb-2 ${
                    selectedLocation === 'gardet' ? 'text-neutral-200' : 'text-neutral-700'
                  }`}>
                    Tisdagar 13:00–14:00
                  </div>
                  <div className={`text-xs ${
                    selectedLocation === 'gardet' ? 'text-neutral-300' : 'text-neutral-500'
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
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Vecka
              </label>
              <input type="hidden" {...register('weekStart', { required: 'Välj en vecka' })} />
              <div ref={weekDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-teal transition-all bg-white text-left flex items-center justify-between"
                >
                  <span className={selectedWeek ? 'text-neutral-900 text-sm' : 'text-neutral-500 text-sm'}>
                    {selectedWeek 
                      ? `Vecka ${getWeekNumber(parseISO(selectedWeek))} (${formatWeekRange(parseISO(selectedWeek))})`
                      : 'Vecka 10 (2 mar - 8 mar)'
                    }
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isWeekDropdownOpen ? 'rotate-180' : ''}`} />
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
                          className={`w-full px-4 py-3 text-sm text-left hover:bg-primary-teal/10 transition-colors ${
                            isSelected ? 'bg-primary-teal/10 text-primary-teal font-medium' : 'text-neutral-900'
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
                  className="w-4 h-4 text-primary-teal focus:ring-2 focus:ring-primary-teal/20 border-neutral-300 rounded mt-0.5"
                />
                <span className="ml-3 text-sm text-neutral-900">
                  Jag godkänner <a href="#" className="text-primary-teal hover:underline font-medium underline">villkoren</a>
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
              className="w-full bg-primary-teal text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-teal/90 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed text-base"
            >
              {isSubmitting ? 'Skickar...' : 'SKICKA ANMÄLAN'}
            </button>
          </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-300 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-neutral-600">
          © 2026 Eudora Babyrytmik
        </div>
      </footer>
    </div>
  );
}
