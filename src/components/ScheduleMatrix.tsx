import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Edit2,
  Filter,
  Info,
  Search,
} from 'lucide-react';
import { DayShiftInfo, Employee, EmployeeMonthCalculation, ShiftOverride, ShiftStatus } from '../types/schedule.ts';
import {
  getDaysInMonth,
  formatDate,
  formatCurrency,
  RUSSIAN_WEEKDAYS_SHORT,
  STATUS_METAS,
  parseDate,
} from '../utils/scheduleCalculator.ts';

interface ScheduleMatrixProps {
  employees: Employee[];
  year: number;
  month: number;
  overrides: Record<string, ShiftOverride>;
  employeeShiftsMap: Record<string, DayShiftInfo[]>;
  payrollMap: Record<string, EmployeeMonthCalculation>;
  onCellClick: (employee: Employee, dateStr: string, baseStatus: 'WORK' | 'OFF', currentOverride?: ShiftOverride) => void;
  onEditEmployee: (employee: Employee) => void;
  selectedDepartment: string;
}

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  employees,
  year,
  month,
  overrides,
  employeeShiftsMap,
  payrollMap,
  onCellClick,
  onEditEmployee,
  selectedDepartment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightStatus, setHighlightStatus] = useState<ShiftStatus | null>(null);

  const totalDays = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Today check
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const todayDayNumber = now.getDate();

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Top Filter and Search Bar */}
      <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по ФИО или должности..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <span className="text-xs text-slate-500 hidden md:inline">
            Работников: <strong className="text-slate-900">{filteredEmployees.length}</strong> из {employees.length}
          </span>
        </div>

        {/* Legend pills with interactive click-to-highlight */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3 h-3" />
            <span>Подсветка:</span>
          </span>

          {(Object.keys(STATUS_METAS) as ShiftStatus[]).map((statusKey) => {
            const meta = STATUS_METAS[statusKey];
            const isSelected = highlightStatus === statusKey;
            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => setHighlightStatus(isSelected ? null : statusKey)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition ${
                  isSelected
                    ? `${meta.bgClass} ring-2 ring-blue-500`
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
                }`}
                title={meta.label}
              >
                {meta.code} <span className="font-normal opacity-85 hidden lg:inline">{meta.label}</span>
              </button>
            );
          })}

          {highlightStatus && (
            <button
              type="button"
              onClick={() => setHighlightStatus(null)}
              className="text-[11px] text-blue-600 hover:underline ml-1 font-semibold"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Grid container with horizontal scrolling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold sticky top-0 z-20 backdrop-blur-md border-b border-slate-200">
              {/* Employee Column Header */}
              <th className="py-3 px-4 min-w-[240px] max-w-[280px] sticky left-0 z-20 bg-slate-50 border-r border-slate-200 shadow-2xs font-bold text-slate-800">
                Сотрудник / График / Ставка
              </th>

              {/* Day Number Headers */}
              {daysArray.map((day) => {
                const dateStr = formatDate(year, month, day);
                const dateObj = parseDate(dateStr);
                const dayOfWeek = dateObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isToday = isCurrentMonth && day === todayDayNumber;
                const dayName = RUSSIAN_WEEKDAYS_SHORT[dayOfWeek];

                return (
                  <th
                    key={day}
                    className={`p-1 text-center min-w-[34px] max-w-[36px] border-r border-slate-200/80 ${
                      isToday
                        ? 'bg-blue-100/70 text-blue-900 ring-1 ring-blue-500'
                        : isWeekend
                        ? 'bg-rose-50/50 text-rose-700'
                        : 'text-slate-600'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold opacity-80">{dayName}</div>
                    <div className={`text-xs font-extrabold ${isToday ? 'text-blue-700 underline' : ''}`}>
                      {day}
                    </div>
                  </th>
                );
              })}

              {/* Summary Columns */}
              <th className="py-3 px-3 text-center min-w-[85px] border-l border-slate-200 bg-slate-50 text-slate-700">
                Смены
              </th>
              <th className="py-3 px-2 text-center min-w-[65px] bg-slate-50 text-rose-700">
                Больн.
              </th>
              <th className="py-3 px-2 text-center min-w-[65px] bg-slate-50 text-teal-700">
                Отпуск
              </th>
              <th className="py-3 px-3 text-right min-w-[120px] bg-slate-50 text-emerald-700 font-bold">
                К выплате
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={totalDays + 5} className="text-center py-12 text-slate-400">
                  Сотрудники не найдены по критериям фильтра
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const shifts = employeeShiftsMap[emp.id] || [];
                const payroll = payrollMap[emp.id];

                return (
                  <tr key={emp.id} className="hover:bg-blue-50/20 transition group">
                    {/* Fixed Left Employee Column */}
                    <td className="py-2.5 px-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 transition border-r border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${emp.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate text-xs">
                              <span title={emp.name}>{emp.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{emp.position}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-semibold">{emp.scheduleType}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit employee button */}
                        <button
                          type="button"
                          onClick={() => onEditEmployee(emp)}
                          title="Редактировать ставку или график"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Daily Rate Badge */}
                      <div className="mt-1.5 flex items-center justify-between text-[11px] bg-slate-50 rounded-lg px-2 py-0.5 border border-slate-200">
                        <span className="text-slate-500">Ставка:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(emp.dailyRate)} / дн.
                        </span>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {daysArray.map((day) => {
                      const shift = shifts[day - 1];
                      if (!shift) {
                        return <td key={day} className="p-1 text-center border-r border-slate-100">-</td>;
                      }

                      const meta = STATUS_METAS[shift.effectiveStatus];
                      const isHighlighted = highlightStatus && shift.effectiveStatus === highlightStatus;
                      const overrideKey = `${emp.id}_${shift.date}`;
                      const curOverride = overrides[overrideKey];

                      return (
                        <td
                          key={day}
                          onClick={() => onCellClick(emp, shift.date, shift.baseStatus, curOverride)}
                          className={`p-0.5 text-center cursor-pointer border-r border-slate-100 transition relative ${
                            shift.isCalendarWeekend ? 'bg-slate-50/60' : ''
                          } ${isHighlighted ? 'ring-2 ring-blue-600 ring-inset' : ''}`}
                        >
                          <div
                            className={`h-9 w-full flex flex-col items-center justify-center rounded-md border text-[11px] font-bold transition transform active:scale-95 shadow-2xs ${meta.bgClass}`}
                            title={`${shift.date} (${shift.dayName})\n${emp.name}\nСтатус: ${meta.label}\nЧасов: ${shift.effectiveHours}ч\n${
                              shift.isOverridden ? `Переопределено вручную${shift.overrideNote ? `: ${shift.overrideNote}` : ''}` : 'По плановому графику'
                            }\n(Нажмите для изменения)`}
                          >
                            <span>{meta.shortLabel}</span>

                            {/* Small Hours indicator */}
                            {shift.effectiveHours > 0 ? (
                              <span className="text-[9px] font-normal opacity-80 leading-none">
                                {shift.effectiveHours}ч
                              </span>
                            ) : (
                              <span className="text-[9px] font-normal opacity-50 leading-none">
                                -
                              </span>
                            )}

                            {/* Blue dot if manually overridden */}
                            {shift.isOverridden && (
                              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-xs" />
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Summary Columns */}
                    <td className="py-2 px-2 text-center border-l border-slate-200 bg-slate-50/40">
                      <div className="font-bold text-slate-800 text-xs">
                        {payroll?.actualWorkedDays || 0}{' '}
                        <span className="font-normal text-slate-400 text-[10px]">/ {payroll?.plannedWorkDays || 0}</span>
                      </div>
                      {payroll && payroll.unplannedWorkDays > 0 && (
                        <div className="text-[10px] text-indigo-700 font-semibold">
                          +{payroll.unplannedWorkDays} внепл.
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-1 text-center bg-slate-50/40">
                      <span className={`text-xs font-semibold ${payroll?.sickDays ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>
                        {payroll?.sickDays || 0}
                      </span>
                    </td>

                    <td className="py-2 px-1 text-center bg-slate-50/40">
                      <span className={`text-xs font-semibold ${payroll?.vacationDays ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
                        {payroll?.vacationDays || 0}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right bg-slate-50/40">
                      <div className="font-extrabold text-emerald-700 text-xs">
                        {payroll ? formatCurrency(payroll.totalPayout) : '0 ₽'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {payroll?.totalWorkedHours || 0} часов
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Legend */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Как менять смены:</strong> Кликните на любую ячейку дня, чтобы поставить отпуск, больничный, выходной или смену.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-[11px]">Синяя точка = ручное переопределение</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span className="text-[11px]">Выходные дни календаря (сб, вс)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
