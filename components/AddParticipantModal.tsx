'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { X, ChevronDown } from 'lucide-react';
import {
  Location,
  TimeSlot,
  LOCATIONS,
  TIME_SLOTS,
  getSessionKey,
  formatSessionLabel,
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
}

interface Props {
  onClose: () => void;
}

export default function AddParticipantModal({ onClose }: Props) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, watch, control, setValue } = useForm<FormData>();
  const { addRegistration, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedTimeSlot = watch('timeSlot');
  const selectedWeek = watch('weekStart');

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
      setMessage({ type: 'success', text: 'Deltagare tillagd!' });
      reset();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const availableSpots = selectedWeek && selectedLocation && selectedTimeSlot
    ? getAvailableSpots(selectedWeek, selectedLocation, selectedTimeSlot)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Lägg till deltagare</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Förnamn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'Förnamn krävs' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Efternamn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Efternamn krävs' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-post <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'E-post krävs',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ogiltig e-postadress'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Telefonnummer krävs' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pass <span className="text-red-500">*</span>
            </label>
            <input type="hidden" {...register('location', { required: 'Välj ett pass' })} />
            <input type="hidden" {...register('timeSlot', { required: 'Välj ett pass' })} />
            <div className="space-y-3">
              {(Object.keys(LOCATIONS) as Location[]).map((location) => (
                <div key={location}>
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {LOCATIONS[location].label} · {LOCATIONS[location].day}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(TIME_SLOTS) as TimeSlot[]).map((timeSlot) => {
                      const isSelected =
                        selectedLocation === location && selectedTimeSlot === timeSlot;

                      return (
                        <button
                          key={getSessionKey(location, timeSlot)}
                          type="button"
                          onClick={() => {
                            setValue('location', location);
                            setValue('timeSlot', timeSlot);
                          }}
                          className={`px-3 py-2 text-sm rounded-md border transition-colors text-left ${
                            isSelected
                              ? 'border-teal bg-teal/10 text-teal font-medium'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          {formatSessionLabel(location, timeSlot)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {(errors.location || errors.timeSlot) && (
              <p className="text-red-600 text-sm mt-1">Välj ett pass</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vecka <span className="text-red-500">*</span>
            </label>
            <Controller
              name="weekStart"
              control={control}
              rules={{ required: 'Välj en vecka' }}
              render={({ field }) => (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent bg-white text-left flex items-center justify-between"
                  >
                    <span className={field.value ? 'text-gray-900' : 'text-gray-400'}>
                      {field.value 
                        ? `Vecka ${getWeekNumber(new Date(field.value))} (${formatWeekRange(new Date(field.value))})`
                        : 'Välj vecka'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  {weekDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {availableWeeks.map(week => {
                        const weekKey = formatDate(week);
                        const weekNum = getWeekNumber(week);
                        return (
                          <button
                            key={weekKey}
                            type="button"
                            onClick={() => {
                              field.onChange(weekKey);
                              setWeekDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                              field.value === weekKey ? 'bg-gray-100 font-medium' : ''
                            }`}
                          >
                            Vecka {weekNum} ({formatWeekRange(week)})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            />
            {errors.weekStart && (
              <p className="text-red-600 text-sm mt-1">{errors.weekStart.message}</p>
            )}
            {availableSpots !== null && (
              <p className="text-sm mt-1 text-gray-600">
                {availableSpots > 0 ? (
                  <span className="text-green-600">✓ {availableSpots} platser kvar</span>
                ) : (
                  <span className="text-red-600">✗ Fullbokad</span>
                )}
              </p>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={availableSpots === 0}
              className="flex-1 bg-teal text-white py-3 px-6 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
