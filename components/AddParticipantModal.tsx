'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import {
  Location,
  TimeSlot,
  MAX_CAPACITY_PER_SESSION,
} from '@/lib/schedule';
import { Alert, Button, Field, Input, Modal, Select, SessionPicker } from '@/components/ui';

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
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>();
  const { addRegistration, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedTimeSlot = watch('timeSlot');
  const selectedWeek = watch('weekStart');

  const availableWeeks = getNext10Weeks().filter((week) => {
    const weekKey = formatDate(week);
    return weekAvailability[weekKey]?.isAvailable !== false;
  });

  const weekOptions = availableWeeks.map((week) => ({
    value: formatDate(week),
    label: `Vecka ${getWeekNumber(week)} (${formatWeekRange(week)})`,
  }));

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

  const availableSpots =
    selectedWeek && selectedLocation && selectedTimeSlot
      ? getAvailableSpots(selectedWeek, selectedLocation, selectedTimeSlot)
      : null;

  const sessionError = errors.location || errors.timeSlot;

  return (
    <Modal title="Lägg till deltagare" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6">
        <div className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Förnamn" htmlFor="add-first-name" required>
              <Input
                id="add-first-name"
                {...register('firstName', { required: 'Förnamn krävs' })}
                error={errors.firstName?.message}
              />
            </Field>

            <Field label="Efternamn" htmlFor="add-last-name" required>
              <Input
                id="add-last-name"
                {...register('lastName', { required: 'Efternamn krävs' })}
                error={errors.lastName?.message}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="E-post" htmlFor="add-email" required>
              <Input
                id="add-email"
                type="email"
                {...register('email', {
                  required: 'E-post krävs',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ogiltig e-postadress',
                  },
                })}
                error={errors.email?.message}
              />
            </Field>

            <Field label="Telefon" htmlFor="add-phone" required>
              <Input
                id="add-phone"
                type="tel"
                {...register('phone', { required: 'Telefonnummer krävs' })}
                error={errors.phone?.message}
              />
            </Field>
          </div>

          <div>
            <input type="hidden" {...register('location', { required: true })} />
            <input type="hidden" {...register('timeSlot', { required: true })} />
            <Field label="Pass" required>
              <SessionPicker
                location={selectedLocation}
                timeSlot={selectedTimeSlot}
                onLocationChange={(location) =>
                  setValue('location', location, { shouldValidate: true })
                }
                onTimeSlotChange={(timeSlot) =>
                  setValue('timeSlot', timeSlot, { shouldValidate: true })
                }
              />
            </Field>
            {sessionError && (
              <p className="mt-1.5 text-sm text-error">Välj förskola och tid</p>
            )}
          </div>

          <Field label="Vecka" required>
            <input type="hidden" {...register('weekStart', { required: 'Välj en vecka' })} />
            <Select
              compact
              value={selectedWeek ?? ''}
              placeholder="Välj vecka"
              options={weekOptions}
              onChange={(value) => setValue('weekStart', value, { shouldValidate: true })}
              error={errors.weekStart?.message}
            />
            {availableSpots !== null && (
              <p className="mt-2 text-sm text-muted">
                {availableSpots > 0 ? (
                  <span>{availableSpots} platser kvar</span>
                ) : (
                  <span className="text-error">Fullbokad</span>
                )}
              </p>
            )}
          </Field>

          {message && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'}>
              {message.text}
            </Alert>
          )}

          <div className="flex gap-3 border-t border-ink/10 pt-5">
            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
              Avbryt
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={availableSpots === 0}
            >
              Lägg till
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
