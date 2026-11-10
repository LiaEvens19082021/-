import React, { useState } from 'react';
import {
  DollarSign,
  FileSpreadsheet,
  Printer,
  Search,
  ArrowUpDown,
  FileText,
  Edit2,
  Check,
  HeartPulse,
  Sun,
  TrendingUp,
  Baby,
  Cake,
  Gift,
  Phone,
  Trash2,
} from 'lucide-react';
import { Employee, EmployeeMonthCalculation, DayShiftInfo } from '../types/schedule.ts';
import { formatCurrency, formatNumber, RUSSIAN_MONTHS } from '../utils/scheduleCalculator.ts';
import { PayslipModal } from './PayslipModal.tsx';

interface PayrollViewProps {
  employees: Employee[];
  payrollList: EmployeeMonthCalculation[];
  shiftsMap: Record<string, DayShiftInfo[]>;
  year: number;
  month: number;
  selectedDepartment: string;
  onUpdateEmployeeRate: (employeeId: string, newRate: number) => void;
  onUpdateEmployeeBonus: (employeeId: string, newBonus: number) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onExportCsv: () => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  payrollList,
  shiftsMap,
  year,
  month,
  selectedDepartment,
  onUpdateEmployeeRate,
  onUpdateEmployeeBonus,
  onEditEmployee,
  onDeleteEmployee,
  onExportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<{
    emp: Employee;
    calc: EmployeeMonthCalculation;
    shifts: DayShiftInfo[];
  } | null>(null);

  // In-line editing state for rate
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);

  // In-line editing state for bonus
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null);
  const [tempBonus, setTempBonus] = useState<number>(0);

  const [sortField, setSortField] = useState<'name' | 'shifts' | 'rate' | 'total'>('total');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const monthName = RUSSIAN_MONTHS[month - 1];

  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Totals
  const totalBasePay = payrollList.reduce((acc, p) => acc + p.basePay, 0);
  const totalSickPay = payrollList.reduce((acc, p) => acc + p.sickPay, 0);
  const totalVacationPay = payrollList.reduce((acc, p) => acc + p.vacationPay, 0);
  const totalMaternityPay = payrollList.reduce((acc, p) => acc + (p.maternityPay || 0), 0);
  const totalBonuses = payrollList.reduce((acc, p) => acc + p.monthlyBonus, 0);
  const totalJubileeBonuses = payrollList.reduce((acc, p) => acc + (p.jubileeBonus || 0), 0);
  const totalPayoutFund = payrollList.reduce((acc, p) => acc + p.totalPayout, 0);
  const totalWorkedShifts = payrollList.reduce((acc, p) => acc + p.actualWorkedDays, 0);
  const totalSickDays = payrollList.reduce((acc, p) => acc + p.sickDays, 0);
  const totalVacationDays = payrollList.reduce((acc, p) => acc + p.vacationDays, 0);
  const totalMaternityDays = payrollList.reduce((acc, p) => acc + (p.maternityDays || 0), 0);

  // Filter & sort
  const filteredList = payrollList.filter((item) => {
    const emp = employeeMap.get(item.employeeId);
    if (!emp) return false;
    const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    const empA = employeeMap.get(a.employeeId);
    const empB = employeeMap.get(b.employeeId);
    let cmp = 0;

    switch (sortField) {
      case 'name':
        cmp = (empA?.name || '').localeCompare(empB?.name || '');
        break;
      case 'shifts':
        cmp = a.actualWorkedDays - b.actualWorkedDays;
        break;
      case 'rate':
        cmp = a.dailyRate - b.dailyRate;
        break;
      case 'total':
      default:
        cmp = a.totalPayout - b.totalPayout;
        break;
    }

    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleStartEditRate = (empId: string, currentRate: number) => {
    setEditingRateId(empId);
    setTempRate(currentRate);
  };

  const handleSaveRate = (empId: string) => {
    onUpdateEmployeeRate(empId, tempRate);
    setEditingRateId(null);
  };

  const handleStartEditBonus = (empId: string, currentBonus: number) => {
    setEditingBonusId(empId);
    setTempBonus(currentBonus);
  };

  const handleSaveBonus = (empId: string) => {
    onUpdateEmployeeBonus(empId, tempBonus);
    setEditingBonusId(null);
  };

  return (
    <div className="space-y-5">
      {/* Financial KPI Cards (Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Payroll Fund */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">Итоговый ФОТ</span>
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-blue-950 mt-1.5 truncate">
            {formatCurrency(totalPayoutFund)}
          </div>
          <div className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{monthName} {year}</span>
          </div>
        </div>

        {/* Base Work Shifts Pay */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Оплата смен</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {totalWorkedShifts} смен
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1.5 truncate">
            {formatCurrency(totalBasePay)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            По дневным ставкам
          </div>
        </div>

        {/* Sick Leave Compensations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Больничные</span>
            <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-rose-700 mt-1.5 truncate">
            {formatCurrency(totalSickPay)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            За {totalSickDays} дн. болезни
          </div>
        </div>

        {/* Vacation Compensations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Отпускные</span>
            <div className="p-1 rounded-md bg-teal-50 text-teal-600 border border-teal-200">
              <Sun className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-teal-700 mt-1.5 truncate">
            {formatCurrency(totalVacationPay)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            За {totalVacationDays} дн. отпуска
          </div>
        </div>

        {/* Maternity Compensations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Декретные (БиР)</span>
            <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
              <Baby className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold text-purple-800 mt-1.5 truncate">
            {formatCurrency(totalMaternityPay)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalMaternityDays} дн. + пособия
          </div>
        </div>

        {/* Bonuses & Jubilee */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Премии и Юбилеи</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Cake className="w-3 h-3 inline mr-1 text-amber-600" />
              Бонусы
            </span>
          </div>
          <div className="text-lg font-bold text-amber-900 mt-1.5 truncate">
            {formatCurrency(totalBonuses + totalJubileeBonuses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalJubileeBonuses > 0 ? `Вкл. юбилеи: ${formatCurrency(totalJubileeBonuses)}` : 'Индивидуальные надбавки'}
          </div>
        </div>
      </div>

      {/* Main Payroll Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Расчётная ведомость начислений за {monthName} {year}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Автоматический подсчёт рабочих смен, больничных пособий и отпускных компенсаций
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2 w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Экспорт в Excel (CSV)</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => {
                    if (sortField === 'name') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('name');
                      setSortDirection('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Сотрудник / Отдел</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => {
                    if (sortField === 'rate') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('rate');
                      setSortDirection('desc');
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Ставка за 1 день</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th
                  onClick={() => {
                    if (sortField === 'shifts') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('shifts');
                      setSortDirection('desc');
                    }
                  }}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 transition text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Смены (Факт/План)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-3 text-right">Оплата смен</th>
                <th className="py-3 px-3 text-center">Больничный</th>
                <th className="py-3 px-3 text-center">Отпуск</th>
                <th className="py-3 px-3 text-center">Декрет (БиР)</th>
                <th className="py-3 px-3 text-right">Премия / Юбилей</th>

                <th
                  onClick={() => {
                    if (sortField === 'total') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortField('total');
                      setSortDirection('desc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer text-right hover:text-slate-900 transition"
                >
                  <div className="flex items-center justify-end gap-1 text-emerald-800 font-extrabold">
                    <span>ИТОГО К ВЫПЛАТЕ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                <th className="py-3 px-4 text-center">Действия</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Нет сотрудников для отображения
                  </td>
                </tr>
              ) : (
                sortedList.map((item) => {
                  const emp = employeeMap.get(item.employeeId);
                  if (!emp) return null;

                  const isEditingRate = editingRateId === emp.id;
                  const isEditingBonus = editingBonusId === emp.id;

                  return (
                    <tr key={item.employeeId} className="hover:bg-slate-50/70 transition">
                      {/* Employee Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${emp.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            {emp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
                              {item.isJubileeThisMonth && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                                  <Cake className="w-3 h-3 text-amber-600" />
                                  <span>Юбилей {item.jubileeAge} лет!</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span>{emp.position}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-semibold">{emp.scheduleType}</span>
                              <span>•</span>
                              <span>{emp.department}</span>
                              {emp.phone && (
                                <>
                                  <span>•</span>
                                  <a
                                    href={`tel:${emp.phone}`}
                                    className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition"
                                    title={`Позвонить: ${emp.phone}`}
                                  >
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{emp.phone}</span>
                                  </a>
                                </>
                              )}
                              {emp.birthDate && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500">
                                    {emp.birthDate} ({item.age} л.)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Daily Rate (Editable directly or via modal) */}
                      <td className="py-3 px-3">
                        {isEditingRate ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="100"
                              step="50"
                              value={tempRate}
                              onChange={(e) => setTempRate(Number(e.target.value))}
                              className="w-24 bg-white border border-blue-500 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRate(emp.id)}
                              className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Сохранить ставку"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditRate(emp.id, emp.dailyRate)}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 group/rate"
                            title="Нажмите, чтобы изменить ставку"
                          >
                            <span className="font-extrabold text-slate-900 text-xs">
                              {formatCurrency(item.dailyRate)}
                            </span>
                            <span className="text-[10px] text-slate-400">/ дн.</span>
                            <Edit2 className="w-3 h-3 text-slate-400 group-hover/rate:text-blue-600 transition ml-0.5" />
                          </div>
                        )}
                      </td>

                      {/* Shifts Count */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900 text-xs">
                          <span className="text-emerald-700">{item.actualWorkedDays}</span>
                          <span className="text-slate-400 font-normal">/ {item.plannedWorkDays} смен</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.totalWorkedHours} ч.
                          {item.unplannedWorkDays > 0 && (
                            <span className="text-indigo-700 font-semibold ml-1">
                              (+{item.unplannedWorkDays} внеплан.)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Base Worked Pay */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatCurrency(item.basePay)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.actualWorkedDays} × {formatNumber(item.dailyRate)} ₽
                        </div>
                      </td>

                      {/* Sick Leave */}
                      <td className="py-3 px-3 text-center">
                        {item.sickDays > 0 ? (
                          <div>
                            <div className="font-bold text-rose-700 text-xs">
                              +{formatCurrency(item.sickPay)}
                            </div>
                            <div className="text-[10px] text-rose-600">
                              {item.sickDays} дн. ({emp.sickPayPercentage}%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Vacation */}
                      <td className="py-3 px-3 text-center">
                        {item.vacationDays > 0 ? (
                          <div>
                            <div className="font-bold text-teal-700 text-xs">
                              +{formatCurrency(item.vacationPay)}
                            </div>
                            <div className="text-[10px] text-teal-600">
                              {item.vacationDays} дн. ({emp.vacationPayPercentage}%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Maternity Pay (Декрет / БиР) */}
                      <td className="py-3 px-3 text-center">
                        {item.maternityDays > 0 ? (
                          <div className="bg-purple-50/60 p-1 rounded-lg border border-purple-200">
                            <div className="font-bold text-purple-900 text-xs">
                              +{formatCurrency(item.maternityPay)}
                            </div>
                            <div className="text-[10px] text-purple-700 font-medium">
                              {item.maternityDays} дн. декрета
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Bonus & Jubilee */}
                      <td className="py-3 px-3 text-right">
                        <div className="space-y-1">
                          {isEditingBonus ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                min="0"
                                step="500"
                                value={tempBonus}
                                onChange={(e) => setTempBonus(Number(e.target.value))}
                                className="w-20 bg-white border border-blue-500 text-slate-900 text-xs font-bold rounded-lg px-2 py-1 outline-none text-right"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveBonus(emp.id)}
                                className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEditBonus(emp.id, emp.monthlyBonus)}
                              className="cursor-pointer hover:text-amber-700 group/bonus text-right"
                              title="Нажмите, чтобы изменить премию"
                            >
                              <span className="font-bold text-amber-800 text-xs">
                                {item.monthlyBonus > 0 ? formatCurrency(item.monthlyBonus) : '—'}
                              </span>
                            </div>
                          )}

                          {item.jubileeBonus > 0 && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                              <Cake className="w-3 h-3 text-amber-600" />
                              <span>+{formatCurrency(item.jubileeBonus)} юбилей</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* TOTAL PAYOUT */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-extrabold text-emerald-700 text-sm">
                          {formatCurrency(item.totalPayout)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayslipEmp({
                                emp,
                                calc: item,
                                shifts: shiftsMap[emp.id] || [],
                              });
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-[11px] font-semibold transition shadow-2xs"
                            title="Открыть подробный расчётный листок"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Листок</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditEmployee(emp)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Настройки работника"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteEmployee && (
                            <button
                              type="button"
                              onClick={() => onDeleteEmployee(emp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title={`Удалить сотрудника ${emp.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Footer */}
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-3.5 px-4 text-slate-900 text-xs">
                  ИТОГО ПО ВЕДОМОСТИ ({sortedList.length} сотр.):
                </td>
                <td className="py-3.5 px-3 text-slate-400 text-xs">-</td>
                <td className="py-3.5 px-3 text-center text-slate-900 text-xs">
                  {sortedList.reduce((acc, p) => acc + p.actualWorkedDays, 0)} смен
                </td>
                <td className="py-3.5 px-3 text-right text-slate-900 text-xs">
                  {formatCurrency(sortedList.reduce((acc, p) => acc + p.basePay, 0))}
                </td>
                <td className="py-3.5 px-3 text-center text-rose-700 text-xs">
                  {formatCurrency(sortedList.reduce((acc, p) => acc + p.sickPay, 0))}
                </td>
                <td className="py-3.5 px-3 text-center text-teal-700 text-xs">
                  {formatCurrency(sortedList.reduce((acc, p) => acc + p.vacationPay, 0))}
                </td>
                <td className="py-3.5 px-3 text-right text-amber-800 text-xs">
                  {formatCurrency(sortedList.reduce((acc, p) => acc + p.monthlyBonus, 0))}
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-700 text-base font-extrabold">
                  {formatCurrency(sortedList.reduce((acc, p) => acc + p.totalPayout, 0))}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-400 text-xs">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslipEmp && (
        <PayslipModal
          employee={selectedPayslipEmp.emp}
          payroll={selectedPayslipEmp.calc}
          shifts={selectedPayslipEmp.shifts}
          year={year}
          month={month}
          onClose={() => setSelectedPayslipEmp(null)}
        />
      )}
    </div>
  );
};
