import React, { useState } from 'react';
import { X, Briefcase, Calendar, Check, Users } from 'lucide-react';
import { Employee, SchedulePatternType } from '../types/schedule.ts';
import { SCHEDULE_LABELS } from '../utils/scheduleCalculator.ts';

interface BulkScheduleModalProps {
  employees: Employee[];
  departments: string[];
  onApplyBulkSchedule: (employeeIds: string[], newSchedule: SchedulePatternType, newHours: number, cycleDate: string) => void;
  onClose: () => void;
}

export const BulkScheduleModal: React.FC<BulkScheduleModalProps> = ({
  employees,
  departments,
  onApplyBulkSchedule,
  onClose,
}) => {
  const [targetGroup, setTargetGroup] = useState<string>('ALL');
  const [selectedSchedule, setSelectedSchedule] = useState<SchedulePatternType>('2/2');
  const [shiftHours, setShiftHours] = useState<number>(12);
  const [cycleStartDate, setCycleStartDate] = useState<string>('2026-11-01');

  const filteredEmployees = targetGroup === 'ALL'
    ? employees
    : employees.filter((e) => e.department === targetGroup);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredEmployees.length === 0) return;

    onApplyBulkSchedule(
      filteredEmployees.map((e) => e.id),
      selectedSchedule,
      shiftHours,
      cycleStartDate
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span>Смена графика работы</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Назначение графика сразу для всех работников или выбранного отдела
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Кого перевести на новый график:</span>
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Все работники ({employees.length} чел.)</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Отдел: {dept} ({employees.filter((e) => e.department === dept).length} чел.)
                </option>
              ))}
            </select>
          </div>

          {/* New Schedule Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Новый график:
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => {
                const s = e.target.value as SchedulePatternType;
                setSelectedSchedule(s);
                if (s === '5/2') setShiftHours(8);
                else if (s === '1/3') setShiftHours(24);
                else if (s === '2/2') setShiftHours(12);
              }}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(Object.keys(SCHEDULE_LABELS) as SchedulePatternType[]).map((type) => (
                <option key={type} value={type}>
                  {SCHEDULE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Hours & Cycle Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Часов в смене:
              </label>
              <select
                value={shiftHours}
                onChange={(e) => setShiftHours(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8 часов</option>
                <option value={10}>10 часов</option>
                <option value={12}>12 часов</option>
                <option value={24}>24 часа (сутки)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Дата первой смены:</span>
              </label>
              <input
                type="date"
                required
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Affected Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500">Будет обновлено:</span>
            <span className="font-bold text-slate-900">{filteredEmployees.length} сотрудников</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Применить график</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
