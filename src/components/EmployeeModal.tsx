import React, { useState } from 'react';
import { X, User, DollarSign, Calendar, Clock, HeartPulse, Sparkles, Trash2, Check } from 'lucide-react';
import { Employee, SchedulePatternType } from '../types/schedule.ts';
import { SCHEDULE_LABELS } from '../utils/scheduleCalculator.ts';

interface EmployeeModalProps {
  employee?: Employee | null;
  departments: string[];
  onSave: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const AVATAR_COLORS = [
  'from-blue-600 to-indigo-600',
  'from-violet-600 to-purple-600',
  'from-amber-600 to-orange-600',
  'from-emerald-600 to-teal-600',
  'from-cyan-600 to-blue-600',
  'from-pink-600 to-rose-600',
  'from-fuchsia-600 to-pink-600',
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  departments,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = Boolean(employee);

  const [name, setName] = useState(employee?.name || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [department, setDepartment] = useState(employee?.department || departments[0] || 'Производство');
  const [dailyRate, setDailyRate] = useState<number>(employee?.dailyRate ?? 3500);
  const [shiftHours, setShiftHours] = useState<number>(employee?.shiftHours ?? 8);
  const [scheduleType, setScheduleType] = useState<SchedulePatternType>(employee?.scheduleType || '2/2');
  const [cycleStartDate, setCycleStartDate] = useState(employee?.cycleStartDate || '2026-11-01');
  const [sickPayPercentage, setSickPayPercentage] = useState<number>(employee?.sickPayPercentage ?? 80);
  const [vacationPayPercentage, setVacationPayPercentage] = useState<number>(employee?.vacationPayPercentage ?? 100);
  const [monthlyBonus, setMonthlyBonus] = useState<number>(employee?.monthlyBonus ?? 0);
  const [avatarColor, setAvatarColor] = useState(
    employee?.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Employee = {
      id: employee?.id || `emp-${Date.now()}`,
      name: name.trim(),
      position: position.trim() || 'Сотрудник',
      department: department.trim() || 'Общий',
      dailyRate: Math.max(0, Number(dailyRate)),
      shiftHours: Math.max(1, Math.min(24, Number(shiftHours))),
      scheduleType,
      cycleStartDate,
      sickPayPercentage: Math.max(0, Math.min(100, Number(sickPayPercentage))),
      vacationPayPercentage: Math.max(0, Math.min(100, Number(vacationPayPercentage))),
      monthlyBonus: Math.max(0, Number(monthlyBonus)),
      avatarColor,
      active: true,
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-xs`}>
              {name ? name.substring(0, 2).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Настройка сотрудника' : 'Добавление нового сотрудника'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing ? 'Изменение графика, ставки за день и параметров' : 'Заполните данные для графика и расчёта зарплаты'}
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Full Name & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ФИО сотрудника: *
              </label>
              <input
                type="text"
                required
                placeholder="Иванов Иван Иванович"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Должность:
              </label>
              <input
                type="text"
                placeholder="Оператор, Инженер, Менеджер..."
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Отдел / Подразделение:
            </label>
            <input
              type="text"
              list="dept-options"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Производство, Склад, Бухгалтерия..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="dept-options">
              {departments.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          {/* RATE & HOURS - Core User Requirement */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Оплата труда и длительность смены</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ставка за 1 рабочий день (₽): *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold rounded-xl px-3 py-2 pl-8 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-xs">₽</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Начисляется за каждую отработанную смену
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Часов в одной смене:</span>
                </label>
                <select
                  value={shiftHours}
                  onChange={(e) => setShiftHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8 часов (стандарт 5/2)</option>
                  <option value={10}>10 часов</option>
                  <option value={12}>12 часов (стандарт 2/2)</option>
                  <option value={24}>24 часа (сутки 1/3)</option>
                  <option value={6}>6 часов</option>
                </select>
              </div>
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>График работы и дата первой смены</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Тип графика:
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => {
                    const newType = e.target.value as SchedulePatternType;
                    setScheduleType(newType);
                    if (newType === '5/2' && shiftHours === 12) setShiftHours(8);
                    if (newType === '1/3') setShiftHours(24);
                    if (newType === '2/2' && shiftHours === 8) setShiftHours(12);
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

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Дата начала цикла (1-я смена):
                </label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Определяет чередование рабочих дней для 2/2, 3/3, 1/3
                </p>
              </div>
            </div>
          </div>

          {/* SICK LEAVE & VACATION RATES & BONUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>Оплата больничного:</span>
              </label>
              <select
                value={sickPayPercentage}
                onChange={(e) => setSickPayPercentage(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={100}>100% от ставки</option>
                <option value={80}>80% от ставки</option>
                <option value={60}>60% от ставки</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Оплата отпуска:</span>
              </label>
              <select
                value={vacationPayPercentage}
                onChange={(e) => setVacationPayPercentage(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={100}>100% от ставки</option>
                <option value={80}>80% от ставки</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Месячная премия (₽):
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={monthlyBonus}
                onChange={(e) => setMonthlyBonus(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Удалить сотрудника ${employee?.name}?`)) {
                    onDelete(employee!.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить сотрудника</span>
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
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Сохранить изменения' : 'Создать сотрудника'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
