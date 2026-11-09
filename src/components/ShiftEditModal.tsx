import React, { useState } from 'react';
import { X, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Employee, ShiftOverride, ShiftStatus } from '../types/schedule.ts';
import { STATUS_METAS, formatCurrency, parseDate, RUSSIAN_WEEKDAYS_SHORT } from '../utils/scheduleCalculator.ts';

interface ShiftEditModalProps {
  employee: Employee;
  dateStr: string; // YYYY-MM-DD
  baseStatus: 'WORK' | 'OFF';
  currentOverride?: ShiftOverride;
  onSave: (override: ShiftOverride | null) => void;
  onClose: () => void;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  employee,
  dateStr,
  baseStatus,
  currentOverride,
  onSave,
  onClose,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ShiftStatus>(
    currentOverride ? currentOverride.status : baseStatus
  );
  const [customHours, setCustomHours] = useState<number>(
    currentOverride?.customHours ?? employee.shiftHours
  );
  const [note, setNote] = useState<string>(currentOverride?.note || '');

  const dateObj = parseDate(dateStr);
  const dayOfWeekName = RUSSIAN_WEEKDAYS_SHORT[dateObj.getDay()];
  const [y, m, d] = dateStr.split('-');
  const formattedDate = `${d}.${m}.${y} (${dayOfWeekName})`;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === baseStatus && !note.trim() && customHours === employee.shiftHours) {
      onSave(null);
      return;
    }

    onSave({
      employeeId: employee.id,
      date: dateStr,
      status: selectedStatus,
      customHours: (selectedStatus === 'WORK' || selectedStatus === 'UNPLANNED_WORK') ? customHours : 0,
      note: note.trim(),
    });
  };

  const handleResetToDefault = () => {
    onSave(null);
  };

  let estimatedDayPay = 0;
  if (selectedStatus === 'WORK' || selectedStatus === 'UNPLANNED_WORK') {
    estimatedDayPay = employee.dailyRate;
  } else if (selectedStatus === 'SICK') {
    estimatedDayPay = Math.round(employee.dailyRate * (employee.sickPayPercentage / 100));
  } else if (selectedStatus === 'VACATION') {
    estimatedDayPay = Math.round(employee.dailyRate * (employee.vacationPayPercentage / 100));
  } else if (selectedStatus === 'MATERNITY') {
    estimatedDayPay = Math.round(employee.dailyRate * ((employee.maternityPayPercentage ?? 100) / 100));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Редактирование смены
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.name} • <span className="text-blue-700 font-semibold">{formattedDate}</span>
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
        <form onSubmit={handleApply} className="p-6 space-y-4">
          {/* Base Schedule Notice */}
          <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500">График по умолчанию:</span>
            <span className="font-semibold text-slate-800">
              {baseStatus === 'WORK' ? `Плановая смена (${employee.shiftHours} ч)` : 'Плановый выходной'}
            </span>
          </div>

          {/* Status Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Выберите статус дня:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STATUS_METAS) as ShiftStatus[]).map((statusKey) => {
                const meta = STATUS_METAS[statusKey];
                const isSelected = selectedStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setSelectedStatus(statusKey)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-[26px] h-[26px] rounded-lg text-xs font-bold border shrink-0 ${meta.bgClass}`}
                    >
                      {meta.shortLabel}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                        {meta.label}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-auto shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {meta.code === 'ВР'
                          ? 'Смена в выходной'
                          : meta.code === 'ВВ'
                          ? 'Внеплановый отгул'
                          : meta.code === 'Б'
                          ? `Оплата ${employee.sickPayPercentage}%`
                          : meta.code === 'Д'
                          ? `Декрет (${employee.maternityPayPercentage ?? 100}%)`
                          : meta.code === 'ОТ'
                          ? 'Оплачиваемый отпуск'
                          : meta.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Hours for Work Shifts */}
          {(selectedStatus === 'WORK' || selectedStatus === 'UNPLANNED_WORK') && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Длительность рабочей смены (часов):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500">
                  (Стандарт для сотрудника: {employee.shiftHours} ч.)
                </span>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Примечание / причина (необязательно):</span>
            </label>
            <input
              type="text"
              placeholder="Например: Замена коллеги, номер больничного листа..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Financial Preview */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-emerald-900 font-medium">Начисление за этот день:</span>
              <div className="text-[11px] text-emerald-700">
                Ставка: {formatCurrency(employee.dailyRate)} / день
              </div>
            </div>
            <div className="text-sm font-bold text-emerald-800">
              +{formatCurrency(estimatedDayPay)}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            {currentOverride ? (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-rose-600 hover:text-rose-700 hover:underline"
              >
                Вернуть по графику
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                Сохранить смену
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
