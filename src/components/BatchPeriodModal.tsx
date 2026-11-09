import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, HeartPulse, Sun, AlertTriangle, Check, Layers, Baby } from 'lucide-react';
import { Employee, ShiftOverride, ShiftStatus } from '../types/schedule.ts';
import { formatDate, parseDate, diffDays, formatCurrency } from '../utils/scheduleCalculator.ts';

interface BatchPeriodModalProps {
  employees: Employee[];
  year: number;
  month: number;
  onApplyBatch: (overrides: ShiftOverride[]) => void;
  onClose: () => void;
}

export const BatchPeriodModal: React.FC<BatchPeriodModalProps> = ({
  employees,
  year,
  month,
  onApplyBatch,
  onClose,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(employees[0]?.id || 'ALL');
  const defaultStartDate = formatDate(year, month, 1);
  const defaultEndDate = formatDate(year, month, Math.min(7, 28));

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [actionType, setActionType] = useState<ShiftStatus>('VACATION');
  const [note, setNote] = useState<string>('Ежегодный отпуск');
  const [customHours, setCustomHours] = useState<number>(8);

  const calculateDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const diff = diffDays(endDate, startDate);
    return diff >= 0 ? diff + 1 : 0;
  };

  const daysCount = calculateDaysCount();
  const targetEmployees = selectedTarget === 'ALL'
    ? employees
    : employees.filter((e) => e.id === selectedTarget);

  const handleActionChange = (newStatus: ShiftStatus) => {
    setActionType(newStatus);
    if (newStatus === 'VACATION') setNote('Ежегодный оплачиваемый отпуск');
    else if (newStatus === 'SICK') setNote('Больничный лист');
    else if (newStatus === 'MATERNITY') setNote('Отпуск по беременности и родам (декрет)');
    else if (newStatus === 'UNPLANNED_OFF') setNote('Внеплановые отгулы');
    else if (newStatus === 'UNPLANNED_WORK') setNote('Дополнительные рабочие смены');
    else if (newStatus === 'WORK') setNote('Рабочие смены по графику');
    else if (newStatus === 'OFF') setNote('Выходные дни');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (daysCount <= 0) return;

    const newOverrides: ShiftOverride[] = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const cursorDate = new Date(startYear, startMonth - 1, startDay);

    for (let i = 0; i < daysCount; i++) {
      const curYear = cursorDate.getFullYear();
      const curMonth = cursorDate.getMonth() + 1;
      const curDay = cursorDate.getDate();
      const dateStr = formatDate(curYear, curMonth, curDay);

      targetEmployees.forEach((emp) => {
        newOverrides.push({
          employeeId: emp.id,
          date: dateStr,
          status: actionType,
          customHours: (actionType === 'WORK' || actionType === 'UNPLANNED_WORK') ? customHours : 0,
          note: note.trim(),
        });
      });

      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    onApplyBatch(newOverrides);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Назначение на период</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Установка отпуска, больничного или смен на выбранный интервал дат
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
          {/* Target employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Для кого применить:
            </label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">👥 Для всех сотрудников ({employees.length} чел.)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name} ({emp.position}) — ставка {formatCurrency(emp.dailyRate)}/дн.
                </option>
              ))}
            </select>
          </div>

          {/* Type of change */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Тип назначения на выбранные дни:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleActionChange('VACATION')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  actionType === 'VACATION'
                    ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold">Отпуск (ОТ)</span>
                <span className="text-[10px] text-teal-700">Оплачиваемый</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionChange('SICK')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  actionType === 'SICK'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold">Больничный (Б)</span>
                <span className="text-[10px] text-rose-700">По ставке %</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionChange('MATERNITY')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  actionType === 'MATERNITY'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Baby className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">Декрет (Д)</span>
                <span className="text-[10px] text-purple-700">БиР / Уход</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionChange('UNPLANNED_OFF')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  actionType === 'UNPLANNED_OFF'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Отгул (ВВ)</span>
                <span className="text-[10px] text-amber-700">Внеплановый</span>
              </button>

              <button
                type="button"
                onClick={() => handleActionChange('UNPLANNED_WORK')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  actionType === 'UNPLANNED_WORK'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">Смена (ВР)</span>
                <span className="text-[10px] text-indigo-700">В выходной</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Дата начала:
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Дата окончания:
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Days count indicator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Количество дней:</span>
            <span className="font-bold text-blue-700">
              {daysCount > 0 ? `${daysCount} календарных дней` : 'Некорректный интервал'}
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Примечание / Приказ:
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Приказ об отпуске, номер больничного..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Submit buttons */}
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
              disabled={daysCount <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Применить на {daysCount} дн.</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
