'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { X } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: 'sodermalm' | 'gardet';
  weekStart: string;
}

interface Props {
  onClose: () => void;
}

export default function AddParticipantModal({ onClose }: Props) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
  const { addRegistration, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedWeek = watch('weekStart');

  const availableWeeks = getNext10Weeks().filter(week => {
    const weekKey = formatDate(week);
    return weekAvailability[weekKey]?.isAvailable !== false;
  });

  const getAvailableSpots = (weekStart: string, location: 'sodermalm' | 'gardet') => {
    if (!weekStart || !location) return 15;
    const registrations = getWeekRegistrations(weekStart, location);
    return 15 - registrations.length;
  };

  const onSubmit = (data: FormData) => {
    const result = addRegistration({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
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

  const availableSpots = selectedWeek && selectedLocation 
    ? getAvailableSpots(selectedWeek, selectedLocation)
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
              Plats <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sodermalm"
                  {...register('location', { required: 'Välj en plats' })}
                  className="w-4 h-4 text-teal focus:ring-teal"
                />
                <span className="ml-2 text-gray-700">Södermalm</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="gardet"
                  {...register('location', { required: 'Välj en plats' })}
                  className="w-4 h-4 text-teal focus:ring-teal"
                />
                <span className="ml-2 text-gray-700">Gärdet</span>
              </label>
            </div>
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vecka <span className="text-red-500">*</span>
            </label>
            <select
              {...register('weekStart', { required: 'Välj en vecka' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Välj vecka</option>
              {availableWeeks.map(week => {
                const weekKey = formatDate(week);
                const weekNum = getWeekNumber(week);
                return (
                  <option key={weekKey} value={weekKey}>
                    Vecka {weekNum} ({formatWeekRange(week)})
                  </option>
                );
              })}
            </select>
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
