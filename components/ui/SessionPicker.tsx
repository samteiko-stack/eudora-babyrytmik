import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import {
  Location,
  TimeSlot,
  LOCATIONS,
  TIME_SLOTS,
} from '@/lib/schedule';

interface SessionPickerProps {
  location?: Location;
  timeSlot?: TimeSlot;
  onLocationChange: (location: Location) => void;
  onTimeSlotChange: (timeSlot: TimeSlot) => void;
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-2.5 text-sm transition-colors',
        selected
          ? 'bg-field text-white'
          : 'border border-field bg-surface text-ink hover:bg-bg-sage'
      )}
    >
      {children}
    </button>
  );
}

export function SessionPicker({
  location,
  timeSlot,
  onLocationChange,
  onTimeSlotChange,
}: SessionPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Förskola</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(LOCATIONS) as Location[]).map((locationKey) => (
            <OptionButton
              key={locationKey}
              selected={location === locationKey}
              onClick={() => onLocationChange(locationKey)}
            >
              Eudora {LOCATIONS[locationKey].label}
            </OptionButton>
          ))}
        </div>
        {location && (
          <p className="mt-2 text-xs text-muted">
            {LOCATIONS[location].day} · {LOCATIONS[location].address}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Tid</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TIME_SLOTS) as TimeSlot[]).map((slotKey) => (
            <OptionButton
              key={slotKey}
              selected={timeSlot === slotKey}
              onClick={() => onTimeSlotChange(slotKey)}
            >
              {TIME_SLOTS[slotKey].time}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}
