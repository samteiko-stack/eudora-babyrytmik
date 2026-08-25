'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { Lock, Unlock } from 'lucide-react';
import { LOCATIONS, TIME_SLOTS, MAX_CAPACITY_PER_SESSION } from '@/lib/schedule';
import { Badge, Button, ConfirmModal, Modal } from '@/components/ui';

interface Props {
  onClose: () => void;
}

export default function WeekManagementModal({ onClose }: Props) {
  const { weekAvailability, toggleWeekAvailability, getWeekRegistrations } = useStore();
  const [pendingToggle, setPendingToggle] = useState<{ weekKey: string; count: number } | null>(null);

  const weeks = getNext10Weeks();

  const handleToggle = (weekKey: string) => {
    const sodMorning = getWeekRegistrations(weekKey, 'sodermalm', 'morning');
    const sodAfternoon = getWeekRegistrations(weekKey, 'sodermalm', 'afternoon');
    const gardMorning = getWeekRegistrations(weekKey, 'gardet', 'morning');
    const gardAfternoon = getWeekRegistrations(weekKey, 'gardet', 'afternoon');
    const totalRegistrations =
      sodMorning.length + sodAfternoon.length + gardMorning.length + gardAfternoon.length;

    if (totalRegistrations > 0) {
      setPendingToggle({ weekKey, count: totalRegistrations });
      return;
    }

    toggleWeekAvailability(weekKey);
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      toggleWeekAvailability(pendingToggle.weekKey);
      setPendingToggle(null);
    }
  };

  return (
    <>
      <Modal title="Hantera veckor" onClose={onClose} size="lg">
        <div className="overflow-y-auto p-6">
          <p className="mb-6 text-base text-muted">
            Stäng av veckor som inte ska vara tillgängliga för anmälan.
            Veckor som redan har anmälningar kan fortfarande stängas av, men befintliga anmälningar påverkas inte.
          </p>

          <div className="space-y-3">
            {weeks.map((week) => {
              const weekKey = formatDate(week);
              const weekNum = getWeekNumber(week);
              const isAvailable = weekAvailability[weekKey]?.isAvailable !== false;
              const sodMorning = getWeekRegistrations(weekKey, 'sodermalm', 'morning');
              const sodAfternoon = getWeekRegistrations(weekKey, 'sodermalm', 'afternoon');
              const gardMorning = getWeekRegistrations(weekKey, 'gardet', 'morning');
              const gardAfternoon = getWeekRegistrations(weekKey, 'gardet', 'afternoon');
              const totalRegistrations =
                sodMorning.length + sodAfternoon.length + gardMorning.length + gardAfternoon.length;

              return (
                <div
                  key={weekKey}
                  className={`border p-4 transition-colors ${
                    isAvailable ? 'border-ink/10 bg-surface' : 'border-error/30 bg-error-bg'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-ink">Vecka {weekNum}</h3>
                        <span className="text-sm text-muted">{formatWeekRange(week)}</span>
                        {!isAvailable && <Badge variant="error">Stängd</Badge>}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted">
                        <div>
                          {LOCATIONS.sodermalm.label}:{' '}
                          <strong className="text-ink">
                            {TIME_SLOTS.morning.time} {sodMorning.length}/{MAX_CAPACITY_PER_SESSION}
                          </strong>
                          {' · '}
                          <strong className="text-ink">
                            {TIME_SLOTS.afternoon.time} {sodAfternoon.length}/{MAX_CAPACITY_PER_SESSION}
                          </strong>
                        </div>
                        <div>
                          {LOCATIONS.gardet.label}:{' '}
                          <strong className="text-ink">
                            {TIME_SLOTS.morning.time} {gardMorning.length}/{MAX_CAPACITY_PER_SESSION}
                          </strong>
                          {' · '}
                          <strong className="text-ink">
                            {TIME_SLOTS.afternoon.time} {gardAfternoon.length}/{MAX_CAPACITY_PER_SESSION}
                          </strong>
                        </div>
                        <div>
                          Totalt: <strong className="text-ink">{totalRegistrations}</strong>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isAvailable ? 'secondary' : 'primary'}
                      size="sm"
                      className="shrink-0 normal-case"
                      onClick={() => handleToggle(weekKey)}
                    >
                      {isAvailable ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Öppen
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Stängd
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-ink/10 pt-6">
            <Button type="button" variant="primary" size="lg" className="w-full" onClick={onClose}>
              Stäng
            </Button>
          </div>
        </div>
      </Modal>

      {pendingToggle && (
        <ConfirmModal
          title="Ändra veckostatus"
          message={
            <>
              Det finns <strong>{pendingToggle.count} anmälningar</strong> för denna vecka.
              Är du säker på att du vill ändra tillgängligheten?
            </>
          }
          confirmLabel="Fortsätt"
          onConfirm={confirmToggle}
          onCancel={() => setPendingToggle(null)}
        />
      )}
    </>
  );
}
