'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import {
  Location,
  TimeSlot,
  LOCATIONS,
  TIME_SLOTS,
  getSessionKey,
  formatLocationSchedule,
  MAX_CAPACITY_PER_SESSION,
} from '@/lib/schedule';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: Location;
  timeSlot: TimeSlot;
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
  const selectedTimeSlot = watch('timeSlot');
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

  const getAvailableSpots = (weekStart: string, location: Location, timeSlot: TimeSlot) => {
    if (!weekStart || !location || !timeSlot) return MAX_CAPACITY_PER_SESSION;
    const registrations = getWeekRegistrations(weekStart, location, timeSlot);
    return MAX_CAPACITY_PER_SESSION - registrations.length;
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
      timeSlot: data.timeSlot,
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

  const availableSpots = selectedWeek && selectedLocation && selectedTimeSlot
    ? getAvailableSpots(selectedWeek, selectedLocation, selectedTimeSlot)
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
            15 platser tillgängliga per pass
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Anmälan till babysång
          </h1>
          <p className="text-sm sm:text-base text-neutral-900 leading-relaxed">
            Vi ses på <strong>{formatLocationSchedule('sodermalm')}</strong> och på <strong>{formatLocationSchedule('gardet')}</strong>. Under samlingen sjunger vi gamla och nya sånger för och med barnen på svenska och engelska. Vi använder rörelse, spelar rytminstrument och lyssnar på musik. Anmäl ditt barn nedan:
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

            {/* Session Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                Vilket pass vill du anmäla dig till?
              </label>
              <input type="hidden" {...register('location', { required: 'Välj ett pass' })} />
              <input type="hidden" {...register('timeSlot', { required: 'Välj ett pass' })} />
              <div className="space-y-4">
                {(Object.keys(LOCATIONS) as Location[]).map((location) => {
                  const loc = LOCATIONS[location];

                  return (
                    <div key={location}>
                      <div className="mb-2">
                        <div className="text-sm font-semibold text-neutral-900">{loc.label}</div>
                        <div className="text-xs text-neutral-500">{loc.address} · {loc.day}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(TIME_SLOTS) as TimeSlot[]).map((timeSlot) => {
                          const slot = TIME_SLOTS[timeSlot];
                          const isSelected =
                            selectedLocation === location && selectedTimeSlot === timeSlot;

                          return (
                            <div
                              key={getSessionKey(location, timeSlot)}
                              onClick={() => {
                                setValue('location', location);
                                setValue('timeSlot', timeSlot);
                              }}
                              className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                                isSelected
                                  ? 'border-neutral-900 bg-neutral-900 text-white'
                                  : 'border-neutral-300 hover:border-neutral-400 bg-white'
                              }`}
                            >
                              <div className={`text-sm font-bold mb-1 ${
                                isSelected ? 'text-white' : 'text-neutral-900'
                              }`}>
                                {slot.time}
                              </div>
                              <div className={`text-xs ${
                                isSelected ? 'text-neutral-300' : 'text-neutral-500'
                              }`}>
                                {loc.dayShort} · {slot.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(errors.location || errors.timeSlot) && (
                <p className="text-error text-xs mt-1.5">Välj ett pass</p>
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
              {availableSpots !== null && selectedLocation && selectedTimeSlot && (
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
