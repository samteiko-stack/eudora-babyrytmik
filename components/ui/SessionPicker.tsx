import { cn } from '@/lib/cn';
import {
  Location,
  TimeSlot,
  LOCATIONS,
  TIME_SLOTS,
  getSessionKey,
} from '@/lib/schedule';
import { ChoiceCard } from './ChoiceCard';

interface SessionPickerProps {
  location?: Location;
  timeSlot?: TimeSlot;
  onChange: (location: Location, timeSlot: TimeSlot) => void;
}

export function SessionPicker({ location, timeSlot, onChange }: SessionPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(LOCATIONS) as Location[]).map((locationKey) => {
          const loc = LOCATIONS[locationKey];
          const isActive = location === locationKey;

          return (
            <div
              key={locationKey}
              className={cn(
                'border-2 bg-surface p-4',
                isActive ? 'border-field bg-bg-sage' : 'border-field'
              )}
            >
              <div className="mb-4 border-b-2 border-field pb-3">
                <p className="text-base font-bold text-ink">{loc.label}</p>
                <p className="mt-1 text-sm text-ink">{loc.day}</p>
                <p className="text-xs text-muted">{loc.address}</p>
              </div>

              <div className="grid gap-2">
                {(Object.keys(TIME_SLOTS) as TimeSlot[]).map((slotKey) => {
                  const slot = TIME_SLOTS[slotKey];

                  return (
                    <ChoiceCard
                      key={getSessionKey(locationKey, slotKey)}
                      selected={isActive && timeSlot === slotKey}
                      title={slot.time}
                      description={slot.label}
                      onClick={() => onChange(locationKey, slotKey)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {location && timeSlot && (
        <p className="mt-3 text-sm text-ink">
          Valt: <strong>{LOCATIONS[location].label}</strong>
          {' · '}
          {LOCATIONS[location].dayShort.toLowerCase()} {TIME_SLOTS[timeSlot].time}
        </p>
      )}
    </div>
  );
}
