import React, { useState, useMemo, useEffect } from 'react';
import { Employee, ShiftOverride, SchedulePatternType, DayShiftInfo, EmployeeMonthCalculation } from './types/schedule.ts';
import { INITIAL_EMPLOYEES, INITIAL_OVERRIDES } from './data/initialData.ts';
import {
  getEmployeeMonthShifts,
  calculateEmployeeMonthlyPayroll,
  formatCurrency,
  formatDate,
  RUSSIAN_MONTHS,
  getJubileesInMonth,
} from './utils/scheduleCalculator.ts';
import { Header } from './components/Header.tsx';
import { ScheduleMatrix } from './components/ScheduleMatrix.tsx';
import { PayrollView } from './components/PayrollView.tsx';
import { CalendarEmployeeView } from './components/CalendarEmployeeView.tsx';
import { ShiftEditModal } from './components/ShiftEditModal.tsx';
import { EmployeeModal } from './components/EmployeeModal.tsx';
import { BatchPeriodModal } from './components/BatchPeriodModal.tsx';
import { BulkScheduleModal } from './components/BulkScheduleModal.tsx';
import { JubileeCelebrationModal } from './components/JubileeCelebrationModal.tsx';

const STORAGE_KEYS = {
  EMPLOYEES: 'shift_app_employees_v1',
  OVERRIDES: 'shift_app_overrides_v1',
};

export default function App() {
  // Current date anchor
  const now = new Date();
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(11); // November 2026

  // View Navigation
  const [activeTab, setActiveTab] = useState<'matrix' | 'payroll' | 'calendar'>('matrix');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Persistent State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  const [overrides, setOverrides] = useState<Record<string, ShiftOverride>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_OVERRIDES;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save employees', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
    } catch (e) {
      console.error('Failed to save overrides', e);
    }
  }, [overrides]);

  // Set initial selected employee
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  // Modals state
  const [shiftEditTarget, setShiftEditTarget] = useState<{
    employee: Employee;
    dateStr: string;
    baseStatus: 'WORK' | 'OFF';
    currentOverride?: ShiftOverride;
  } | null>(null);

  const [employeeModalTarget, setEmployeeModalTarget] = useState<{
    employee?: Employee | null;
  } | null>(null);

  const [isBatchPeriodOpen, setIsBatchPeriodOpen] = useState(false);
  const [isBulkScheduleOpen, setIsBulkScheduleOpen] = useState(false);
  const [isJubileeModalOpen, setIsJubileeModalOpen] = useState(false);

  // Departments list
  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department));
    return Array.from(set).filter(Boolean);
  }, [employees]);

  // Jubilarians celebrating milestone birthdays (>= 50) this month
  const jubilees = useMemo(() => {
    return getJubileesInMonth(employees, year, month);
  }, [employees, year, month]);

  // Monthly shifts map per employee
  const employeeShiftsMap = useMemo(() => {
    const map: Record<string, DayShiftInfo[]> = {};
    for (const emp of employees) {
      map[emp.id] = getEmployeeMonthShifts(emp, year, month, overrides);
    }
    return map;
  }, [employees, year, month, overrides]);

  // Monthly payroll calculation per employee
  const payrollMap = useMemo(() => {
    const map: Record<string, EmployeeMonthCalculation> = {};
    for (const emp of employees) {
      const shifts = employeeShiftsMap[emp.id] || [];
      map[emp.id] = calculateEmployeeMonthlyPayroll(emp, year, month, shifts);
    }
    return map;
  }, [employees, year, month, employeeShiftsMap]);

  const payrollList = useMemo(() => {
    return employees.map((emp) => payrollMap[emp.id]).filter(Boolean);
  }, [employees, payrollMap]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  // Shift override handler
  const handleSaveShiftOverride = (override: ShiftOverride | null) => {
    if (!shiftEditTarget) return;

    const key = `${shiftEditTarget.employee.id}_${shiftEditTarget.dateStr}`;
    setOverrides((prev) => {
      const copy = { ...prev };
      if (!override) {
        delete copy[key];
      } else {
        copy[key] = override;
      }
      return copy;
    });

    setShiftEditTarget(null);
  };

  // Batch period handler
  const handleApplyBatchPeriod = (newOverrides: ShiftOverride[]) => {
    setOverrides((prev) => {
      const copy = { ...prev };
      newOverrides.forEach((ov) => {
        const key = `${ov.employeeId}_${ov.date}`;
        copy[key] = ov;
      });
      return copy;
    });
  };

  // Employee Add / Edit / Delete
  const handleSaveEmployee = (emp: Employee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === emp.id);
      if (exists) {
        return prev.map((e) => (e.id === emp.id ? emp : e));
      }
      return [...prev, emp];
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (selectedEmployeeId === id) {
      const remaining = employees.filter((e) => e.id !== id);
      setSelectedEmployeeId(remaining[0]?.id || '');
    }
  };

  // In-line Rate and Bonus updates
  const handleUpdateEmployeeRate = (employeeId: string, newRate: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, dailyRate: Math.max(0, newRate) } : e))
    );
  };

  const handleUpdateEmployeeBonus = (employeeId: string, newBonus: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, monthlyBonus: Math.max(0, newBonus) } : e))
    );
  };

  const handleUpdateJubileeBonus = (employeeId: string, bonus: number) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, jubileeBonus: Math.max(0, bonus) } : e))
    );
  };

  // Bulk schedule change
  const handleApplyBulkSchedule = (
    employeeIds: string[],
    newSchedule: SchedulePatternType,
    newHours: number,
    cycleDate: string
  ) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (employeeIds.includes(e.id)) {
          return {
            ...e,
            scheduleType: newSchedule,
            shiftHours: newHours,
            cycleStartDate: cycleDate,
          };
        }
        return e;
      })
    );
  };

  // Reset to initial demo data
  const handleResetData = () => {
    if (confirm('Сбросить все изменения графиков, ставок и смен к начальным образцам?')) {
      localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
      localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
      setEmployees(INITIAL_EMPLOYEES);
      setOverrides(INITIAL_OVERRIDES);
    }
  };

  // Export full CSV statement
  const handleExportCsv = () => {
    const monthName = RUSSIAN_MONTHS[month - 1];
    const headers = [
      'ФИО сотрудника',
      'Должность',
      'Отдел',
      'График',
      'Дата рождения',
      'Возраст',
      'Ставка за 1 день (руб)',
      'План смен',
      'Отработано смен',
      'Внеплановые смены',
      'Отработано часов',
      'Оплата смен (руб)',
      'Больничные дни',
      'Оплата больничных (руб)',
      'Отпускные дни',
      'Оплата отпуска (руб)',
      'Декретные дни',
      'Оплата декрета и пособия (руб)',
      'Премия (руб)',
      'Юбилейная выплата (руб)',
      'ИТОГО К ВЫПЛАТЕ (руб)',
    ];

    const rows = employees.map((emp) => {
      const calc = payrollMap[emp.id];
      if (!calc) return [];
      return [
        `"${emp.name}"`,
        `"${emp.position}"`,
        `"${emp.department}"`,
        `"${emp.scheduleType}"`,
        `"${emp.birthDate || ''}"`,
        calc.age ?? '',
        calc.dailyRate,
        calc.plannedWorkDays,
        calc.actualWorkedDays,
        calc.unplannedWorkDays,
        calc.totalWorkedHours,
        calc.basePay,
        calc.sickDays,
        calc.sickPay,
        calc.vacationDays,
        calc.vacationPay,
        calc.maternityDays,
        calc.maternityPay,
        calc.monthlyBonus,
        calc.jubileeBonus,
        calc.totalPayout,
      ];
    });

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel Cyrillic support
      headers.join(';') +
      '\n' +
      rows.map((r) => r.join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ведомость_зарплаты_${monthName}_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetToCurrentMonth={handleResetToCurrentMonth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        payrollList={payrollList}
        jubilees={jubilees}
        onOpenAddEmployee={() => setEmployeeModalTarget({ employee: null })}
        onOpenBatchPeriod={() => setIsBatchPeriodOpen(true)}
        onOpenBulkSchedule={() => setIsBulkScheduleOpen(true)}
        onOpenJubileeModal={() => setIsJubileeModalOpen(true)}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departments={departments}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'matrix' && (
          <ScheduleMatrix
            employees={employees}
            year={year}
            month={month}
            overrides={overrides}
            employeeShiftsMap={employeeShiftsMap}
            payrollMap={payrollMap}
            onCellClick={(emp, dateStr, baseStatus, curOverride) => {
              setShiftEditTarget({
                employee: emp,
                dateStr,
                baseStatus,
                currentOverride: curOverride,
              });
            }}
            onEditEmployee={(emp) => setEmployeeModalTarget({ employee: emp })}
            selectedDepartment={selectedDepartment}
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollView
            employees={employees}
            payrollList={payrollList}
            shiftsMap={employeeShiftsMap}
            year={year}
            month={month}
            selectedDepartment={selectedDepartment}
            onUpdateEmployeeRate={handleUpdateEmployeeRate}
            onUpdateEmployeeBonus={handleUpdateEmployeeBonus}
            onEditEmployee={(emp) => setEmployeeModalTarget({ employee: emp })}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarEmployeeView
            employees={employees}
            selectedEmployeeId={selectedEmployeeId || employees[0]?.id || ''}
            onSelectEmployee={setSelectedEmployeeId}
            year={year}
            month={month}
            shifts={employeeShiftsMap[selectedEmployeeId] || []}
            payroll={payrollMap[selectedEmployeeId] || payrollList[0]}
            overrides={overrides}
            onCellClick={(emp, dateStr, baseStatus, curOverride) => {
              setShiftEditTarget({
                employee: emp,
                dateStr,
                baseStatus,
                currentOverride: curOverride,
              });
            }}
            onEditEmployee={(emp) => setEmployeeModalTarget({ employee: emp })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 text-center text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Система планирования смен и расчёта заработной платы © {year}
          </span>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Автоматический расчёт смен, отпусков и больничных</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {shiftEditTarget && (
        <ShiftEditModal
          employee={shiftEditTarget.employee}
          dateStr={shiftEditTarget.dateStr}
          baseStatus={shiftEditTarget.baseStatus}
          currentOverride={shiftEditTarget.currentOverride}
          onSave={handleSaveShiftOverride}
          onClose={() => setShiftEditTarget(null)}
        />
      )}

      {employeeModalTarget && (
        <EmployeeModal
          employee={employeeModalTarget.employee}
          departments={departments}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
          onClose={() => setEmployeeModalTarget(null)}
        />
      )}

      {isBatchPeriodOpen && (
        <BatchPeriodModal
          employees={employees}
          year={year}
          month={month}
          onApplyBatch={handleApplyBatchPeriod}
          onClose={() => setIsBatchPeriodOpen(false)}
        />
      )}

      {isBulkScheduleOpen && (
        <BulkScheduleModal
          employees={employees}
          departments={departments}
          onApplyBulkSchedule={handleApplyBulkSchedule}
          onClose={() => setIsBulkScheduleOpen(false)}
        />
      )}

      {isJubileeModalOpen && (
        <JubileeCelebrationModal
          jubilees={jubilees}
          allEmployees={employees}
          year={year}
          month={month}
          onUpdateJubileeBonus={handleUpdateJubileeBonus}
          onClose={() => setIsJubileeModalOpen(false)}
        />
      )}
    </div>
  );
}
