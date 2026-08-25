import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

import type { Location, TimeSlot } from '@/lib/schedule';

interface WebflowChoiceCardProps {
  selected?: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}

export function WebflowChoiceCard({
  selected,
  title,
  description,
  onClick,
}: WebflowChoiceCardProps) {
  return (
    <button type="button" onClick={onClick} className={cn('wf-choice-card', selected && 'is-selected')}>
      <span className="wf-choice-card__check" aria-hidden={!selected}>
        <Check strokeWidth={3} />
      </span>
      <span className="wf-choice-card__title">{title}</span>
      {description && <span className="wf-choice-card__description">{description}</span>}
    </button>
  );
}

interface SessionSelectorProps {
  location?: Location;
  timeSlot?: TimeSlot;
  onLocationChange: (location: Location) => void;
  onTimeSlotChange: (timeSlot: TimeSlot) => void;
  error?: string;
}

export function SessionSelector({
  location,
  timeSlot,
  onLocationChange,
  onTimeSlotChange,
  error,
}: SessionSelectorProps) {
  return (
    <div className="session-selector">
      <div className="form_field-wrapper">
        <label className="form_field-label">Vilken förskola vill du anmäla dig till?</label>
        <div className="form_field-2col session-selector__grid">
          <WebflowChoiceCard
            selected={location === 'sodermalm'}
            title="Eudora Södermalm"
            description="Torsdagar · Fatburs Brunnsg 17"
            onClick={() => onLocationChange('sodermalm')}
          />
          <WebflowChoiceCard
            selected={location === 'gardet'}
            title="Eudora Gärdet"
            description="Onsdagar · Sandhamnsg 7"
            onClick={() => onLocationChange('gardet')}
          />
        </div>
      </div>

      <div className="form_field-wrapper">
        <label className="form_field-label">Vilken tid passar dig?</label>
        <div className="form_field-2col session-selector__grid">
          <WebflowChoiceCard
            selected={timeSlot === 'morning'}
            title="10:00–11:00"
            description="Förmiddagspass"
            onClick={() => onTimeSlotChange('morning')}
          />
          <WebflowChoiceCard
            selected={timeSlot === 'afternoon'}
            title="13:00–14:00"
            description="Eftermiddagspass"
            onClick={() => onTimeSlotChange('afternoon')}
          />
        </div>
      </div>

      {error && <p className="form_field-error">{error}</p>}
    </div>
  );
}
