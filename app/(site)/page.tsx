'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SiteNav } from '@/components/site/SiteNav';
import { SessionSelector } from '@/components/webflow/SessionSelector';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { useStore } from '@/lib/store';
import {
  Location,
  TimeSlot,
  formatLocationSchedule,
  MAX_CAPACITY_PER_SESSION,
} from '@/lib/schedule';
import { mainSitePath } from '@/lib/site-url';

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

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, resetField } = useForm<FormData>();
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
    <>
      <SiteNav />

      <div className="page-wrapper">
        <section className="is-section background-secondary">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-large offset">
                <div className="contact7_component">
                  <div className="w-layout-grid contact7_content contact7_content--form-right">
                    <div className="contact7_content-left max-width-large">
                      <div className="contact7_heading-wrapper">
                        <div className="margin-bottom margin-small">
                          <div className="larger-tag">
                            <div className="div-block-322">
                              <div className="text-size-regular">
                                Endast <strong>15</strong> platser tillgängliga per pass
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="margin-bottom margin-xsmall">
                          <h2 className="heading-style-h2">Anmälan till babysång</h2>
                        </div>
                        <div className="text-size-medium w-richtext">
                          <p>
                            Vi ses på <strong>{formatLocationSchedule('sodermalm')}</strong> och på{' '}
                            <strong>{formatLocationSchedule('gardet')}</strong>. Under samlingen sjunger vi
                            gamla och nya sånger för och med barnen på svenska och engelska. Vi använder
                            rörelse, spelar rytminstrument och lyssnar på musik. Anmäl ditt barn i formuläret:
                          </p>
                        </div>
                      </div>

                      <div className="contact7_image-wrapper">
                        <img
                          src="/assets/hero-babysang.jpg"
                          alt=""
                          loading="lazy"
                          className="contact7_image"
                        />
                      </div>
                    </div>

                    <div className="contact7_content-right">
                      <div className="contact7_form-block w-form">
                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="contact7_form is-spaced"
                          noValidate
                        >
                          <div className="form_field-2col">
                            <div className="form_field-wrapper">
                              <label htmlFor="first-name" className="form_field-label">
                                Förnamn/First Name
                              </label>
                              <input
                                id="first-name"
                                className="form_input w-input"
                                placeholder="Ex. Anna"
                                {...register('firstName', { required: 'Förnamn krävs' })}
                              />
                              {errors.firstName && (
                                <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                  {errors.firstName.message}
                                </div>
                              )}
                            </div>
                            <div className="form_field-wrapper">
                              <label htmlFor="last-name" className="form_field-label">
                                Efternamn/Last Name
                              </label>
                              <input
                                id="last-name"
                                className="form_input w-input"
                                placeholder="Ex. Jakobsson"
                                {...register('lastName', { required: 'Efternamn krävs' })}
                              />
                              {errors.lastName && (
                                <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                  {errors.lastName.message}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="form_field-2col">
                            <div className="form_field-wrapper">
                              <label htmlFor="email" className="form_field-label">
                                E-post/Email
                              </label>
                              <input
                                id="email"
                                type="email"
                                className="form_input w-input"
                                placeholder="Ex. anna@jakobsson.se"
                                {...register('email', {
                                  required: 'E-post krävs',
                                  pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Ogiltig e-postadress',
                                  },
                                })}
                              />
                              {errors.email && (
                                <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                  {errors.email.message}
                                </div>
                              )}
                            </div>
                            <div className="form_field-wrapper">
                              <label htmlFor="phone" className="form_field-label">
                                Mobilnummer/Phone
                              </label>
                              <input
                                id="phone"
                                type="tel"
                                className="form_input w-input"
                                placeholder="Ex. 070 123 45 67"
                                {...register('phone', { required: 'Telefonnummer krävs' })}
                              />
                              {errors.phone && (
                                <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                  {errors.phone.message}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="padding-vertical padding-xxsmall">
                            <input type="hidden" {...register('location', { required: 'Välj förskola' })} />
                            <input type="hidden" {...register('timeSlot', { required: 'Välj tid' })} />
                            <SessionSelector
                              location={selectedLocation}
                              timeSlot={selectedTimeSlot}
                              onLocationChange={(nextLocation) => {
                                setValue('location', nextLocation, { shouldValidate: true });
                                resetField('timeSlot');
                              }}
                              onTimeSlotChange={(nextTimeSlot) =>
                                setValue('timeSlot', nextTimeSlot, { shouldValidate: true })
                              }
                              error={
                                errors.location || errors.timeSlot
                                  ? 'Välj förskola och tid'
                                  : undefined
                              }
                            />
                          </div>

                          <div className="form_field-wrapper">
                            <label htmlFor="week-select" className="form_field-label">
                              Vecka
                            </label>
                            <select
                              id="week-select"
                              className="form_input is-select-input w-select"
                              value={selectedWeek ?? ''}
                              {...register('weekStart', { required: 'Välj en vecka' })}
                            >
                              <option value="">Välj vecka</option>
                              {availableWeeks.map((week) => {
                                const weekKey = formatDate(week);
                                return (
                                  <option key={weekKey} value={weekKey}>
                                    Vecka {getWeekNumber(week)} ({formatWeekRange(week)})
                                  </option>
                                );
                              })}
                            </select>
                            {errors.weekStart && (
                              <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                {errors.weekStart.message}
                              </div>
                            )}
                            {availableSpots !== null && selectedLocation && selectedTimeSlot && (
                              <div className="text-size-tiny" style={{ marginTop: '0.5rem' }}>
                                {availableSpots > 0 ? (
                                  <span>{availableSpots} platser kvar</span>
                                ) : (
                                  <span style={{ color: '#c45c5c' }}>Fullbokad</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="margin-bottom">
                            <label className="w-checkbox form_checkbox">
                              <div
                                className={`w-checkbox-input w-checkbox-input--inputType-custom form_checkbox-icon${
                                  watch('terms') ? ' w--redirected-checked' : ''
                                }`}
                              />
                              <input
                                type="checkbox"
                                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                                {...register('terms', { required: 'Du måste godkänna villkoren' })}
                              />
                              <span className="form_checkbox-label text-size-small w-form-label">
                                Jag godkänner{' '}
                                <a href={mainSitePath('/integritetspolicy')} className="text-style-link-3">
                                  villkoren
                                </a>
                              </span>
                            </label>
                            {errors.terms && (
                              <div className="text-size-tiny" style={{ color: '#c45c5c', marginTop: '0.5rem' }}>
                                {errors.terms.message}
                              </div>
                            )}
                          </div>

                          {message && (
                            <div
                              className={
                                message.type === 'success'
                                  ? 'form_message-success'
                                  : 'form_message-error'
                              }
                              style={{ padding: '1rem', marginBottom: '1rem' }}
                            >
                              {message.text}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="button max-width-full w-button"
                            disabled={isSubmitting || availableSpots === 0}
                          >
                            {isSubmitting ? 'Vänta...' : 'Skicka anmälan'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
