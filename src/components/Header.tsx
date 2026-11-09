import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Briefcase,
  DollarSign,
  FileSpreadsheet,
  Layers,
  Sun,
  RotateCcw,
  Cake,
  Baby,
} from 'lucide-react';
import { RUSSIAN_MONTHS, formatCurrency } from '../utils/scheduleCalculator.ts';
import { EmployeeMonthCalculation, JubileeCelebration } from '../types/schedule.ts';

interface HeaderProps {
  year: number;
  month: number; // 1-12
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToCurrentMonth: () => void;
  activeTab: 'matrix' | 'payroll' | 'calendar';
  setActiveTab: (tab: 'matrix' | 'payroll' | 'calendar') => void;
  payrollList: EmployeeMonthCalculation[];
  jubilees: JubileeCelebration[];
  onOpenAddEmployee: () => void;
  onOpenBatchPeriod: () => void;
  onOpenBulkSchedule: () => void;
  onOpenJubileeModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  departments: string[];
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onResetToCurrentMonth,
  activeTab,
  setActiveTab,
  payrollList,
  jubilees,
  onOpenAddEmployee,
  onOpenBatchPeriod,
  onOpenBulkSchedule,
  onOpenJubileeModal,
  onExportCsv,
  onResetData,
  selectedDepartment,
  setSelectedDepartment,
  departments,
}) => {
  const totalEmployees = payrollList.length;
  const totalPlannedShifts = payrollList.reduce((acc, p) => acc + p.plannedWorkDays, 0);
  const totalActualShifts = payrollList.reduce((acc, p) => acc + p.actualWorkedDays, 0);
  const totalUnplannedShifts = payrollList.reduce((acc, p) => acc + p.unplannedWorkDays, 0);
  const totalSickDays = payrollList.reduce((acc, p) => acc + p.sickDays, 0);
  const totalVacationDays = payrollList.reduce((acc, p) => acc + p.vacationDays, 0);
  const totalMaternityDays = payrollList.reduce((acc, p) => acc + (p.maternityDays || 0), 0);
  const totalPayrollFund = payrollList.reduce((acc, p) => acc + p.totalPayout, 0);

  const monthName = RUSSIAN_MONTHS[month - 1];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Row: Brand & Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Logo & Simple Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  График Смен и Расчёт Зарплаты
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Светлая тема
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Сменные графики (2/2, 5/2, 1/3), внеплановые смены, больничные и автоматический расчёт выплат
              </p>
            </div>
          </div>

          {/* Month Navigator & Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Clean Month Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={onPrevMonth}
                aria-label="Предыдущий месяц"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 flex items-center gap-1.5 min-w-[140px] justify-center text-center">
                <span className="text-sm font-bold text-slate-900">{monthName}</span>
                <span className="text-sm font-medium text-slate-500">{year}</span>
              </div>

              <button
                type="button"
                onClick={onNextMonth}
                aria-label="Следующий месяц"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-2xs transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onResetToCurrentMonth}
                className="ml-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
              >
                Сегодня
              </button>
            </div>

            {/* Department selector */}
            <select
              aria-label="Фильтр по отделу"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="ALL">Все отделы ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Add Employee Button */}
            <button
              type="button"
              onClick={onOpenAddEmployee}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить работника</span>
            </button>
          </div>
        </div>

        {/* Jubilee Banner (when someone celebrates milestone birthday >= 50) */}
        {jubilees.length > 0 && (
          <div className="mt-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border border-amber-300 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs text-amber-950">
              <span className="p-1 bg-amber-200/80 text-amber-800 rounded-lg shrink-0">
                <Cake className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-amber-900">
                  🎉 Юбилей в {monthName.toLowerCase()} ({jubilees.length} чел.):
                </span>{' '}
                <span>
                  {jubilees.map((j) => `${j.employeeName} — ${j.age} лет (${j.dayOfMonth} ${monthName.toLowerCase()})`).join('; ')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenJubileeModal}
              className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition active:scale-95 shrink-0"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>Поздравить юбиляра</span>
            </button>
          </div>
        )}

        {/* View Switcher Tabs & Tools */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'matrix'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Табель смен</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'payroll'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Расчёт зарплаты</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Календарь сотрудника</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenJubileeModal}
              title="Поздравление работников с юбилеем начиная с 50 лет"
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition shadow-2xs ${
                jubilees.length > 0
                  ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Cake className={`w-3.5 h-3.5 ${jubilees.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Юбиляры ({jubilees.length})</span>
            </button>

            <button
              type="button"
              onClick={onOpenBatchPeriod}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Отпуск / Больничный / Декрет</span>
            </button>

            <button
              type="button"
              onClick={onOpenBulkSchedule}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              <span>Сменить график всем</span>
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Экспорт в Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={onResetData}
              title="Сбросить все изменения к начальным образцам"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clear, Airy KPI Strip (Light Theme) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Сотрудников</span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{totalEmployees} чел.</div>
          </div>

          <div className="bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Отработано смен</span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {totalActualShifts}{' '}
              <span className="text-xs font-normal text-slate-500">/ {totalPlannedShifts}</span>
              {totalUnplannedShifts > 0 && (
                <span className="ml-1 text-[11px] text-indigo-700 font-semibold">
                  (+{totalUnplannedShifts})
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>Больничные</span>
            </div>
            <div className="text-base font-bold text-rose-700 mt-0.5">{totalSickDays} дн.</div>
          </div>

          <div className="bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <Sun className="w-3.5 h-3.5 text-teal-600" />
              <span>Отпуска</span>
            </div>
            <div className="text-base font-bold text-teal-700 mt-0.5">{totalVacationDays} дн.</div>
          </div>

          <div className="bg-purple-50/80 rounded-xl px-3 py-2 border border-purple-200">
            <div className="flex items-center gap-1 text-[11px] text-purple-800 font-medium">
              <Baby className="w-3.5 h-3.5 text-purple-600" />
              <span>Декрет / БиР</span>
            </div>
            <div className="text-base font-bold text-purple-800 mt-0.5">{totalMaternityDays} дн.</div>
          </div>

          <div className="bg-emerald-50/70 rounded-xl px-3 py-2 border border-emerald-200 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>ФОТ с выплатами</span>
            </div>
            <div className="text-base font-extrabold text-emerald-800 mt-0.5 truncate">
              {formatCurrency(totalPayrollFund)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
