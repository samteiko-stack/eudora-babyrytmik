'use client';

import { useStore } from '@/lib/store';
import { getNext10Weeks, formatWeekRange, formatDate, getWeekNumber } from '@/lib/dates';
import { X, Lock, Unlock } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function WeekManagementModal({ onClose }: Props) {
  const { weekAvailability, toggleWeekAvailability, getWeekRegistrations } = useStore();

  const weeks = getNext10Weeks();

  const handleToggle = (weekKey: string) => {
    const sodermalm = getWeekRegistrations(weekKey, 'sodermalm');
    const gardet = getWeekRegistrations(weekKey, 'gardet');
    const hasRegistrations = sodermalm.length > 0 || gardet.length > 0;

    if (hasRegistrations) {
      const confirmed = confirm(
        'Det finns redan anmälningar för denna vecka. Är du säker på att du vill ändra tillgängligheten?'
      );
      if (!confirmed) return;
    }

    toggleWeekAvailability(weekKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Hantera veckor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Stäng av veckor som inte ska vara tillgängliga för anmälan. 
            Veckor som redan har anmälningar kan fortfarande stängas av, men befintliga anmälningar påverkas inte.
          </p>

          <div className="space-y-3">
            {weeks.map(week => {
              const weekKey = formatDate(week);
              const weekNum = getWeekNumber(week);
              const isAvailable = weekAvailability[weekKey]?.isAvailable !== false;
              const sodermalm = getWeekRegistrations(weekKey, 'sodermalm');
              const gardet = getWeekRegistrations(weekKey, 'gardet');
              const totalRegistrations = sodermalm.length + gardet.length;

              return (
                <div
                  key={weekKey}
                  className={`border rounded-lg p-4 transition-colors ${
                    isAvailable ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Vecka {weekNum}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatWeekRange(week)}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-gray-600">
                          Södermalm: <strong>{sodermalm.length}/15</strong>
                        </span>
                        <span className="text-gray-600">
                          Gärdet: <strong>{gardet.length}/15</strong>
                        </span>
                        <span className="text-gray-600">
                          Totalt: <strong>{totalRegistrations}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(weekKey)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                        isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          Öppen
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Stängd
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-teal text-white py-3 px-6 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
