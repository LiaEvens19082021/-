import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBaseStatus,
  calculateEmployeeMonthlyPayroll,
  diffDays,
  formatDate,
  getDaysInMonth,
  getEmployeeMonthShifts,
} from './scheduleCalculator.ts';
import type { Employee, ShiftOverride } from '../types/schedule.ts';

const mockEmployee2_2: Employee = {
  id: 'emp-1',
  name: 'Алексей Иванов',
  position: 'Старший оператор',
  department: 'Производство',
  dailyRate: 4000,
  shiftHours: 12,
  scheduleType: '2/2',
  cycleStartDate: '2026-11-01',
  sickPayPercentage: 80,
  vacationPayPercentage: 100,
  monthlyBonus: 5000,
  avatarColor: '#3b82f6',
  active: true,
};

const mockEmployee5_2: Employee = {
  id: 'emp-2',
  name: 'Елена Смирнова',
  position: 'Бухгалтер',
  department: 'Бухгалтерия',
  dailyRate: 3500,
  shiftHours: 8,
  scheduleType: '5/2',
  cycleStartDate: '2026-11-01',
  sickPayPercentage: 100,
  vacationPayPercentage: 100,
  monthlyBonus: 0,
  avatarColor: '#10b981',
  active: true,
};

test('diffDays calculates correctly across dates and months', () => {
  assert.equal(diffDays('2026-11-01', '2026-11-01'), 0);
  assert.equal(diffDays('2026-11-05', '2026-11-01'), 4);
  assert.equal(diffDays('2026-12-01', '2026-11-01'), 30); // November has 30 days
});

test('getDaysInMonth handles leap and normal months', () => {
  assert.equal(getDaysInMonth(2026, 11), 30); // Nov 2026
  assert.equal(getDaysInMonth(2026, 10), 31); // Oct 2026
  assert.equal(getDaysInMonth(2024, 2), 29);  // Feb 2024 (leap)
  assert.equal(getDaysInMonth(2026, 2), 28);  // Feb 2026 (normal)
});

test('calculateBaseStatus for 5/2 follows Monday-Friday work, Saturday-Sunday off', () => {
  // 2026-11-02 is Monday, 2026-11-06 is Friday, 2026-11-07 is Saturday, 2026-11-08 is Sunday
  assert.equal(calculateBaseStatus(mockEmployee5_2, '2026-11-02'), 'WORK');
  assert.equal(calculateBaseStatus(mockEmployee5_2, '2026-11-06'), 'WORK');
  assert.equal(calculateBaseStatus(mockEmployee5_2, '2026-11-07'), 'OFF');
  assert.equal(calculateBaseStatus(mockEmployee5_2, '2026-11-08'), 'OFF');
});

test('calculateBaseStatus for 2/2 cycles properly: 2 work, 2 off', () => {
  // cycleStartDate is 2026-11-01
  // Day 0: 2026-11-01 -> WORK
  // Day 1: 2026-11-02 -> WORK
  // Day 2: 2026-11-03 -> OFF
  // Day 3: 2026-11-04 -> OFF
  // Day 4: 2026-11-05 -> WORK
  assert.equal(calculateBaseStatus(mockEmployee2_2, '2026-11-01'), 'WORK');
  assert.equal(calculateBaseStatus(mockEmployee2_2, '2026-11-02'), 'WORK');
  assert.equal(calculateBaseStatus(mockEmployee2_2, '2026-11-03'), 'OFF');
  assert.equal(calculateBaseStatus(mockEmployee2_2, '2026-11-04'), 'OFF');
  assert.equal(calculateBaseStatus(mockEmployee2_2, '2026-11-05'), 'WORK');
});

test('getEmployeeMonthShifts respects planned schedule without overrides', () => {
  const shifts = getEmployeeMonthShifts(mockEmployee2_2, 2026, 11, {});
  assert.equal(shifts.length, 30);
  assert.equal(shifts[0].dayNumber, 1);
  assert.equal(shifts[0].baseStatus, 'WORK');
  assert.equal(shifts[0].effectiveStatus, 'WORK');
  assert.equal(shifts[0].effectiveHours, 12);
  assert.equal(shifts[2].baseStatus, 'OFF');
  assert.equal(shifts[2].effectiveStatus, 'OFF');
});

test('override: unplanned day off and unplanned work update effective status and hours', () => {
  const overrides: Record<string, ShiftOverride> = {
    // 2026-11-01 was originally WORK -> marked UNPLANNED_OFF
    'emp-1_2026-11-01': {
      employeeId: 'emp-1',
      date: '2026-11-01',
      status: 'UNPLANNED_OFF',
      note: 'Семейные обстоятельства',
    },
    // 2026-11-03 was originally OFF -> marked UNPLANNED_WORK
    'emp-1_2026-11-03': {
      employeeId: 'emp-1',
      date: '2026-11-03',
      status: 'UNPLANNED_WORK',
      customHours: 12,
      note: 'Замена коллеги',
    },
  };

  const shifts = getEmployeeMonthShifts(mockEmployee2_2, 2026, 11, overrides);
  assert.equal(shifts[0].effectiveStatus, 'UNPLANNED_OFF');
  assert.equal(shifts[0].effectiveHours, 0);
  assert.equal(shifts[0].isOverridden, true);
  assert.equal(shifts[0].overrideNote, 'Семейные обстоятельства');

  assert.equal(shifts[2].effectiveStatus, 'UNPLANNED_WORK');
  assert.equal(shifts[2].effectiveHours, 12);
  assert.equal(shifts[2].isOverridden, true);
});

test('payroll calculation with sick leave and vacation pay', () => {
  // Let's create an employee with:
  // 10 planned work days, 2 sick days (80%), 3 vacation days (100%), 1 unplanned work shift
  const overrides: Record<string, ShiftOverride> = {
    'emp-1_2026-11-01': { employeeId: 'emp-1', date: '2026-11-01', status: 'SICK' },
    'emp-1_2026-11-02': { employeeId: 'emp-1', date: '2026-11-02', status: 'SICK' },
    'emp-1_2026-11-05': { employeeId: 'emp-1', date: '2026-11-05', status: 'VACATION' },
    'emp-1_2026-11-06': { employeeId: 'emp-1', date: '2026-11-06', status: 'VACATION' },
    'emp-1_2026-11-07': { employeeId: 'emp-1', date: '2026-11-07', status: 'VACATION' },
    'emp-1_2026-11-03': { employeeId: 'emp-1', date: '2026-11-03', status: 'UNPLANNED_WORK', customHours: 12 },
  };

  const shifts = getEmployeeMonthShifts(mockEmployee2_2, 2026, 11, overrides);
  const payroll = calculateEmployeeMonthlyPayroll(mockEmployee2_2, 2026, 11, shifts);

  assert.equal(payroll.sickDays, 2);
  assert.equal(payroll.vacationDays, 3);
  assert.equal(payroll.unplannedWorkDays, 1);

  // Rate = 4000
  // Sick pay = 2 days * 4000 * 0.8 = 6400
  assert.equal(payroll.sickPay, 6400);

  // Vacation pay = 3 days * 4000 * 1.0 = 12000
  assert.equal(payroll.vacationPay, 12000);

  // Base pay = actualWorkedDays * 4000
  assert.equal(payroll.basePay, payroll.actualWorkedDays * 4000);

  // Total payout = basePay + sickPay + vacationPay + bonus (5000)
  assert.equal(payroll.totalPayout, payroll.basePay + 6400 + 12000 + 5000);
});

test('rate change dynamically recalculates salary', () => {
  const shifts = getEmployeeMonthShifts(mockEmployee2_2, 2026, 11, {});
  const payrollAt4000 = calculateEmployeeMonthlyPayroll(mockEmployee2_2, 2026, 11, shifts);

  const updatedEmployee = { ...mockEmployee2_2, dailyRate: 5000 };
  const payrollAt5000 = calculateEmployeeMonthlyPayroll(updatedEmployee, 2026, 11, shifts);

  assert.equal(payrollAt4000.dailyRate, 4000);
  assert.equal(payrollAt5000.dailyRate, 5000);
  assert.equal(payrollAt5000.basePay, payrollAt4000.actualWorkedDays * 5000);
  assert.ok(payrollAt5000.totalPayout > payrollAt4000.totalPayout);
});
