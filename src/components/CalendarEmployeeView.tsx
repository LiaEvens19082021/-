import React from 'react';
import {
  Calendar as CalendarIcon,
  User,
  DollarSign,
  HeartPulse,
  Sun,
  Clock,
  Trash2,
} from 'lucide-react';
import { DayShiftInfo, Employee, EmployeeMonthCalculation, ShiftOverride } from '../types/schedule.ts';
import {
  getDaysInMonth,
  formatCurrency,
  RUSSIAN_MONTHS,
  STATUS_METAS,
  RUSSIAN_WEEKDAYS_SHORT,
} from '../utils/scheduleCalculator.ts';

interface CalendarEmployeeViewProps {
  employees: Employee[];
  selectedEmployeeId: string;
  onSelectEmployee: (id: string) => void;
  year: number;
  month: number;
  shifts: DayShiftInfo[];
  payroll: EmployeeMonthCalculation;
  overrides: Record<string, ShiftOverride>;
  onCellClick: (employee: Employee, dateStr: string, baseStatus: 'WORK' | 'OFF', currentOverride?: ShiftOverride) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
}

export const CalendarEmployeeView: React.FC<CalendarEmployeeViewProps> = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  year,
  month,
  shifts,
  payroll,
  overrides,
  onCellClick,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  const currentEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];
  const monthName = RUSSIAN_MONTHS[month - 1];

  // Build calendar matrix (starting Monday = 1 to Sunday = 0/7)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const startingDayOffset = (firstDayOfMonth + 6) % 7;
  const totalDays = getDaysInMonth(year, month);

  const calendarCells = [];
  for (let i = 0; i < startingDayOffset; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d);
  }

  const weekdaysHeader = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  return (
    <div className="space-y-4">
      {/* Employee Selector & Stats Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Employee selector */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${currentEmployee.avatarColor} text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs`}
          >
            {currentEmployee.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={currentEmployee.id}
                onChange={(e) => onSelectEmployee(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{currentEmployee.department}</span>
              <span>•</span>
              <span className="text-blue-700 font-semibold">{currentEmployee.scheduleType} ({currentEmployee.shiftHours}ч)</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => onEditEmployee(currentEmployee)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Настроить ставку / график
              </button>
              {onDeleteEmployee && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onDeleteEmployee(currentEmployee.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium inline-flex items-center gap-1"
                    title={`Удалить сотрудника ${currentEmployee.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Удалить</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Month Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Ставка за день:</span>
            <span className="text-sm font-bold text-emerald-700 block mt-0.5">
              {formatCurrency(currentEmployee.dailyRate)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Отработано:</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">
              {payroll.actualWorkedDays} смен{' '}
              <span className="text-[10px] text-slate-500 font-normal">/ {payroll.plannedWorkDays}</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Больн. / Отпуск:</span>
            <span className="text-sm font-bold text-rose-700 block mt-0.5">
              {payroll.sickDays} б. / {payroll.vacationDays} отп.
            </span>
          </div>

          <div className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200">
            <span className="text-[11px] text-emerald-800 block">К выплате:</span>
            <span className="text-sm font-extrabold text-emerald-800 block mt-0.5">
              {formatCurrency(payroll.totalPayout)}
            </span>
          </div>
        </div>
      </div>

      {/* Big Calendar Grid (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>
              Календарь смен: {currentEmployee.name} — {monthName} {year}
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            Кликните на любой день для изменения статуса смены
          </span>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
          {weekdaysHeader.map((w, idx) => (
            <div
              key={w}
              className={`py-1.5 rounded-lg bg-slate-50 border border-slate-100 ${idx >= 5 ? 'text-rose-700' : 'text-slate-700'}`}
            >
              <span className="hidden sm:inline">{w}</span>
              <span className="sm:hidden">{RUSSIAN_WEEKDAYS_SHORT[(idx + 1) % 7]}</span>
            </div>
          ))}
        </div>

        {/* Calendar days matrix */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="h-24 rounded-xl bg-slate-50/40 border border-transparent" />;
            }

            const shift = shifts[dayNum - 1];
            if (!shift) return null;

            const meta = STATUS_METAS[shift.effectiveStatus];
            const overrideKey = `${currentEmployee.id}_${shift.date}`;
            const curOverride = overrides[overrideKey];

            // Estimated daily payout
            let dayPay = 0;
            if (shift.effectiveStatus === 'WORK' || shift.effectiveStatus === 'UNPLANNED_WORK') {
              dayPay = currentEmployee.dailyRate;
            } else if (shift.effectiveStatus === 'SICK') {
              dayPay = Math.round(currentEmployee.dailyRate * (currentEmployee.sickPayPercentage / 100));
            } else if (shift.effectiveStatus === 'VACATION') {
              dayPay = Math.round(currentEmployee.dailyRate * (currentEmployee.vacationPayPercentage / 100));
            }

            return (
              <div
                key={dayNum}
                onClick={() => onCellClick(currentEmployee, shift.date, shift.baseStatus, curOverride)}
                className={`h-24 sm:h-26 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition transform hover:scale-[1.01] active:scale-95 shadow-2xs ${
                  shift.isCalendarWeekend ? 'bg-slate-50/60' : 'bg-white'
                } ${shift.isOverridden ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${shift.isCalendarWeekend ? 'text-rose-700' : 'text-slate-800'}`}>
                    {dayNum}
                  </span>
                  {shift.isOverridden && (
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-blue-600 text-white rounded">
                      изм.
                    </span>
                  )}
                </div>

                {/* Shift status badge */}
                <div className={`py-1 px-1.5 rounded-lg border text-center ${meta.bgClass}`}>
                  <div className="text-[11px] font-bold leading-tight">{meta.shortLabel}</div>
                  <div className="text-[9px] font-medium opacity-85 truncate hidden sm:block">
                    {meta.label}
                  </div>
                </div>

                {/* Day Pay / Hours */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    {shift.effectiveHours > 0 ? `${shift.effectiveHours} ч` : 'вых.'}
                  </span>
                  {dayPay > 0 ? (
                    <span className="font-semibold text-emerald-700">
                      +{formatCurrency(dayPay)}
                    </span>
                  ) : (
                    <span className="text-slate-400">0 ₽</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
