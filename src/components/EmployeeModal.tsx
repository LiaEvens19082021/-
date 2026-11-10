import React, { useState } from 'react';
import { X, User, DollarSign, Calendar, Clock, HeartPulse, Sparkles, Trash2, Check, Cake, Baby, Gift, Phone } from 'lucide-react';
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
  const [phone, setPhone] = useState(employee?.phone || '');
  const [dailyRate, setDailyRate] = useState<number>(employee?.dailyRate ?? 3500);
  const [shiftHours, setShiftHours] = useState<number>(employee?.shiftHours ?? 8);
  const [scheduleType, setScheduleType] = useState<SchedulePatternType>(employee?.scheduleType || '2/2');
  const [cycleStartDate, setCycleStartDate] = useState(employee?.cycleStartDate || '2026-11-01');
  const [birthDate, setBirthDate] = useState(employee?.birthDate || '');
  const [sickPayPercentage, setSickPayPercentage] = useState<number>(employee?.sickPayPercentage ?? 80);
  const [vacationPayPercentage, setVacationPayPercentage] = useState<number>(employee?.vacationPayPercentage ?? 100);
  const [monthlyBonus, setMonthlyBonus] = useState<number>(employee?.monthlyBonus ?? 0);
  const [avatarColor, setAvatarColor] = useState(employee?.avatarColor || AVATAR_COLORS[0]);
  const [maternityPayPercentage, setMaternityPayPercentage] = useState<number>(employee?.maternityPayPercentage ?? 100);
  const [maternityMonthlyAllowance, setMaternityMonthlyAllowance] = useState<number>(employee?.maternityMonthlyAllowance ?? 0);
  const [jubileeBonus, setJubileeBonus] = useState<number>(employee?.jubileeBonus ?? 10000);

  const calculatedAge = React.useMemo(() => {
    if (!birthDate) return undefined;
    const parts = birthDate.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return undefined;
    return 2026 - parts[0];
  }, [birthDate]);

  const isJubilee = calculatedAge !== undefined && calculatedAge >= 50 && calculatedAge % 5 === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Employee = {
      id: employee?.id || `emp-${Date.now()}`,
      name: name.trim(),
      position: position.trim() || 'Сотрудник',
      department: department.trim() || 'Общий',
      phone: phone.trim() || undefined,
      dailyRate: Math.max(0, Number(dailyRate)),
      shiftHours: Math.max(1, Math.min(24, Number(shiftHours))),
      scheduleType,
      cycleStartDate,
      sickPayPercentage: Math.max(0, Math.min(100, Number(sickPayPercentage))),
      vacationPayPercentage: Math.max(0, Math.min(100, Number(vacationPayPercentage))),
      birthDate: birthDate.trim() || undefined,
      maternityPayPercentage: Math.max(0, Math.min(100, Number(maternityPayPercentage))),
      maternityMonthlyAllowance: Math.max(0, Number(maternityMonthlyAllowance)),
      monthlyBonus: Math.max(0, Number(monthlyBonus)),
      jubileeBonus: isJubilee ? Math.max(0, Number(jubileeBonus)) : undefined,
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

          {/* Department & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Номер телефона:</span>
              </label>
              <input
                type="tel"
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
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

          {/* BIRTHDAY & JUBILEE (50+ years) */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Cake className="w-4 h-4 text-amber-600" />
                <span>Дата рождения и поздравление с юбилеем (от 50 лет)</span>
              </div>
              {calculatedAge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isJubilee
                      ? 'bg-amber-200 text-amber-900 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {calculatedAge} лет {isJubilee && '• 🎉 Юбиляр!'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Дата рождения:
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Система автоматически определит юбилеи: 50, 55, 60, 65, 70+ лет
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Юбилейная выплата (₽):</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="10000"
                  value={jubileeBonus}
                  onChange={(e) => setJubileeBonus(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Начисляется в месяц юбилея
                </p>
              </div>
            </div>
          </div>

          {/* MATERNITY / БиР & УХОД ЗА РЕБЁНКОМ */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <Baby className="w-4 h-4 text-purple-600" />
              <span>Декрет и пособия (отпуск по БиР и уходу за ребёнком)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Оплата дней декрета (% от дневной ставки):
                </label>
                <select
                  value={maternityPayPercentage}
                  onChange={(e) => setMaternityPayPercentage(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={100}>100% от дневной ставки (стандарт БиР)</option>
                  <option value={80}>80% от дневной ставки</option>
                  <option value={40}>40% от ставки (по уходу до 1.5 лет)</option>
                  <option value={0}>0% (без сохранения заработка)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ежемесячное пособие по уходу за ребёнком (₽):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={maternityMonthlyAllowance}
                  onChange={(e) => setMaternityMonthlyAllowance(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Фиксированная ежемесячная выплата при нахождении в декрете
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(employee!.id);
                  onClose();
                }}
                className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
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
