'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import {
  Location,
  TimeSlot,
  formatLocationSchedule,
  MAX_CAPACITY_PER_SESSION,
} from '@/lib/schedule';
import {
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  SessionPicker,
} from '@/components/ui';

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

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>();
  const { addRegistration, initializeWeeks, loadFromDatabase, weekAvailability, getWeekRegistrations } = useStore();

  const selectedLocation = watch('location');
  const selectedTimeSlot = watch('timeSlot');
  const selectedWeek = watch('weekStart');

  useEffect(() => {
    loadFromDatabase();
    initializeWeeks();
  }, [loadFromDatabase, initializeWeeks]);

  const availableWeeks = getNext10Weeks().filter((week) => {
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

  const availableSpots =
    selectedWeek && selectedLocation && selectedTimeSlot
      ? getAvailableSpots(selectedWeek, selectedLocation, selectedTimeSlot)
      : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-section-pattern">
      <header className="relative z-10 border-b border-ink/10 bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <img src="/logo.svg" alt="Eudora Internationella Förskola" className="h-8 w-auto sm:h-10" />
          <a
            href="/admin/login"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:bg-bg hover:text-ink"
          >
            Admin
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl items-stretch gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_0.7fr] lg:gap-[5vw] lg:py-14">
        <section className="max-w-2xl">
          <Badge className="mb-5">
            Endast <strong>15 platser</strong> tillgängliga per pass
          </Badge>

          <h1 className="font-heading mb-4 text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-[3rem]">
            Anmälan till babysång
          </h1>

          <p className="mb-8 text-base leading-relaxed text-ink">
            Vi ses på <strong>{formatLocationSchedule('sodermalm')}</strong> och på{' '}
            <strong>{formatLocationSchedule('gardet')}</strong>. Under samlingen sjunger vi gamla och
            nya sånger för och med barnen på svenska och engelska. Vi använder rörelse, spelar
            rytminstrument och lyssnar på musik. Anmäl ditt barn nedan:
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Förnamn/First Name">
                <Input
                  placeholder="Ex. Anna"
                  error={errors.firstName?.message}
                  {...register('firstName', { required: 'Förnamn krävs' })}
                />
              </Field>
              <Field label="Efternamn/Last Name">
                <Input
                  placeholder="Ex. Jakobsson"
                  error={errors.lastName?.message}
                  {...register('lastName', { required: 'Efternamn krävs' })}
                />
              </Field>
              <Field label="E-post/Email">
                <Input
                  type="email"
                  placeholder="Ex. anna@jakobsson.se"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'E-post krävs',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ogiltig e-postadress',
                    },
                  })}
                />
              </Field>
              <Field label="Mobilnummer/Phone">
                <Input
                  type="tel"
                  placeholder="Ex. 070 123 45 67"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Telefonnummer krävs' })}
                />
              </Field>
            </div>

            <Field label="Vilket pass vill du anmäla dig till?">
              <input type="hidden" {...register('location', { required: 'Välj ett pass' })} />
              <input type="hidden" {...register('timeSlot', { required: 'Välj ett pass' })} />
              <SessionPicker
                location={selectedLocation}
                timeSlot={selectedTimeSlot}
                onLocationChange={(nextLocation) =>
                  setValue('location', nextLocation, { shouldValidate: true })
                }
                onTimeSlotChange={(nextTimeSlot) =>
                  setValue('timeSlot', nextTimeSlot, { shouldValidate: true })
                }
              />
              {(errors.location || errors.timeSlot) && (
                <p className="mt-1.5 text-xs text-error">Välj förskola och tid</p>
              )}
            </Field>

            <Field label="Vecka">
              <input type="hidden" {...register('weekStart', { required: 'Välj en vecka' })} />
              <Select
                value={selectedWeek}
                placeholder="Välj vecka"
                error={errors.weekStart?.message}
                onChange={(value) => setValue('weekStart', value, { shouldValidate: true })}
                options={availableWeeks.map((week) => {
                  const weekKey = formatDate(week);
                  return {
                    value: weekKey,
                    label: `Vecka ${getWeekNumber(week)} (${formatWeekRange(week)})`,
                  };
                })}
              />
              {availableSpots !== null && selectedLocation && selectedTimeSlot && (
                <p className="mt-2 text-xs font-medium">
                  {availableSpots > 0 ? (
                    <span className="text-muted">{availableSpots} platser kvar</span>
                  ) : (
                    <span className="text-error">Fullbokad</span>
                  )}
                </p>
              )}
            </Field>

            <Checkbox
              error={errors.terms?.message}
              label={
                <>
                  Jag godkänner{' '}
                  <a href="#" className="font-bold underline">
                    villkoren
                  </a>
                </>
              }
              {...register('terms', { required: 'Du måste godkänna villkoren' })}
            />

            {message && (
              <div
                className={`border-2 px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'border-accent bg-accent/40 text-ink'
                    : 'border-error/30 bg-error-bg text-ink'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting || availableSpots === 0}
            >
              {isSubmitting ? 'Skickar...' : 'Skicka anmälan'}
            </Button>
          </form>
        </section>

        <aside className="hidden lg:block">
          <div className="overflow-hidden">
            <img
              src="/assets/hero-image.png"
              alt="Barn som leker med trädjur"
              className="aspect-square w-full object-cover"
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
