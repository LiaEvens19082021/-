import type {
  DayShiftInfo,
  Employee,
  EmployeeMonthCalculation,
  JubileeCelebration,
  SchedulePatternType,
  ShiftOverride,
  ShiftStatus,
  StatusMeta,
} from '../types/schedule.ts';

export const STATUS_METAS: Record<ShiftStatus, StatusMeta> = {
  WORK: {
    code: 'Р',
    label: 'Рабочая смена',
    shortLabel: 'Р',
    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    isPaidWork: true,
    isPaidSpecial: false,
    description: 'Обычная запланированная рабочая смена по графику',
  },
  OFF: {
    code: 'В',
    label: 'Выходной',
    shortLabel: 'В',
    bgClass: 'bg-slate-100 text-slate-500 border-slate-250 hover:bg-slate-200/70',
    textClass: 'text-slate-500',
    borderClass: 'border-slate-200',
    isPaidWork: false,
    isPaidSpecial: false,
    description: 'Запланированный выходной день по графику',
  },
  UNPLANNED_OFF: {
    code: 'ВВ',
    label: 'Внеплановый выходной',
    shortLabel: 'ВВ',
    bgClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold hover:bg-amber-200',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300',
    isPaidWork: false,
    isPaidSpecial: false,
    description: 'Внеплановый выходной (отгул / отмена смены). Не оплачивается как рабочая смена.',
  },
  UNPLANNED_WORK: {
    code: 'ВР',
    label: 'Внеплановая смена',
    shortLabel: 'ВР',
    bgClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold hover:bg-indigo-200',
    textClass: 'text-indigo-800',
    borderClass: 'border-indigo-300',
    isPaidWork: true,
    isPaidSpecial: false,
    description: 'Внеплановая рабочая смена (вызов в выходной день / дополнительная смена). Оплачивается по дневной ставке.',
  },
  VACATION: {
    code: 'ОТ',
    label: 'Оплачиваемый отпуск',
    shortLabel: 'ОТ',
    bgClass: 'bg-teal-100 text-teal-900 border-teal-300 font-semibold hover:bg-teal-200',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-300',
    isPaidWork: false,
    isPaidSpecial: true,
    description: 'Ежегодный оплачиваемый отпуск. Рассчитывается от ставки с учётом % отпускных.',
  },
  VACATION_UNPAID: {
    code: 'ДО',
    label: 'Отпуск без сохранения з/п',
    shortLabel: 'ДО',
    bgClass: 'bg-stone-200 text-stone-800 border-stone-300 hover:bg-stone-300',
    textClass: 'text-stone-700',
    borderClass: 'border-stone-300',
    isPaidWork: false,
    isPaidSpecial: false,
    description: 'Отпуск за свой счёт (без сохранения заработной платы).',
  },
  SICK: {
    code: 'Б',
    label: 'Больничный лист',
    shortLabel: 'Б',
    bgClass: 'bg-rose-100 text-rose-900 border-rose-300 font-semibold hover:bg-rose-200',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-300',
    isPaidWork: false,
    isPaidSpecial: true,
    description: 'Больничный лист. Оплачивается по ставке работника с учётом % оплаты больничного.',
  },
  MATERNITY: {
    code: 'Д',
    label: 'Декретный отпуск',
    shortLabel: 'Д',
    bgClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold hover:bg-purple-200',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300',
    isPaidWork: false,
    isPaidSpecial: true,
    description: 'Отпуск по беременности и родам / по уходу за ребёнком. Выплачивается декретное пособие.',
  },
  ABSENCE: {
    code: 'ПР',
    label: 'Прогул / Неявка',
    shortLabel: 'ПР',
    bgClass: 'bg-red-100 text-red-900 border-red-300 font-bold hover:bg-red-200',
    textClass: 'text-red-800',
    borderClass: 'border-red-300',
    isPaidWork: false,
    isPaidSpecial: false,
    description: 'Неявка на работу без уважительной причины. Не оплачивается.',
  },
};

export const RUSSIAN_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const RUSSIAN_WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const SCHEDULE_LABELS: Record<SchedulePatternType, string> = {
  '2/2': '2 через 2 (2 рабочих / 2 выходных)',
  '5/2': '5 через 2 (пн-пт работа, сб-вс выходные)',
  '3/3': '3 через 3 (3 рабочих / 3 выходных)',
  '1/3': '1 через 3 (сутки через трое)',
  '4/2': '4 через 2 (4 рабочих / 2 выходных)',
  '6/1': '6 через 1 (пн-сб работа, вс выходной)',
  'custom': 'Индивидуальный график',
};

/**
 * Returns total days in a given year and month (1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats YYYY-MM-DD
 */
export function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Parses YYYY-MM-DD to Date in local time without UTC offset bugs
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate difference in whole days between two YYYY-MM-DD strings
 */
export function diffDays(dateA: string, dateB: string): number {
  const [y1, m1, d1] = dateA.split('-').map(Number);
  const [y2, m2, d2] = dateB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc1 - utc2) / msPerDay);
}

/**
 * Calculates whether a specific date is a WORK or OFF day according to employee's base schedule
 */
export function calculateBaseStatus(employee: Employee, dateStr: string): 'WORK' | 'OFF' {
  const date = parseDate(dateStr);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

  if (employee.scheduleType === '5/2') {
    // Mon-Fri: Work, Sat-Sun: Off
    return dayOfWeek >= 1 && dayOfWeek <= 5 ? 'WORK' : 'OFF';
  }

  if (employee.scheduleType === '6/1') {
    // Mon-Sat: Work, Sun: Off
    return dayOfWeek >= 1 && dayOfWeek <= 6 ? 'WORK' : 'OFF';
  }

  // Cyclic schedules: 2/2, 3/3, 1/3, 4/2, custom
  let workCount = 2;
  let offCount = 2;

  switch (employee.scheduleType) {
    case '2/2':
      workCount = 2;
      offCount = 2;
      break;
    case '3/3':
      workCount = 3;
      offCount = 3;
      break;
    case '1/3':
      workCount = 1;
      offCount = 3;
      break;
    case '4/2':
      workCount = 4;
      offCount = 2;
      break;
    case 'custom':
      workCount = Math.max(1, employee.customWorkDays || 2);
      offCount = Math.max(1, employee.customOffDays || 2);
      break;
  }

  const period = workCount + offCount;
  const cycleStart = employee.cycleStartDate || '2026-01-01';
  const delta = diffDays(dateStr, cycleStart);

  // Correct modulo for negative numbers
  const offset = ((delta % period) + period) % period;

  return offset < workCount ? 'WORK' : 'OFF';
}

/**
 * Builds shift info for all days in a month for an employee, applying any overrides
 */
export function getEmployeeMonthShifts(
  employee: Employee,
  year: number,
  month: number,
  overrides: Record<string, ShiftOverride>
): DayShiftInfo[] {
  const totalDays = getDaysInMonth(year, month);
  const result: DayShiftInfo[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = formatDate(year, month, day);
    const dateObj = parseDate(dateStr);
    const dayOfWeek = dateObj.getDay();
    const isCalendarWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayName = RUSSIAN_WEEKDAYS_SHORT[dayOfWeek];

    const baseStatus = calculateBaseStatus(employee, dateStr);
    const overrideKey = `${employee.id}_${dateStr}`;
    const override = overrides[overrideKey];

    let effectiveStatus: ShiftStatus = baseStatus;
    let effectiveHours = baseStatus === 'WORK' ? employee.shiftHours : 0;
    let isOverridden = false;
    let overrideNote = '';

    if (override) {
      isOverridden = true;
      effectiveStatus = override.status;
      overrideNote = override.note || '';

      if (override.status === 'WORK' || override.status === 'UNPLANNED_WORK') {
        effectiveHours = override.customHours !== undefined ? override.customHours : employee.shiftHours;
      } else {
        effectiveHours = 0;
      }
    }

    result.push({
      date: dateStr,
      dayNumber: day,
      dayOfWeek,
      dayName,
      isCalendarWeekend,
      baseStatus,
      effectiveStatus,
      effectiveHours,
      isOverridden,
      overrideNote,
    });
  }

  return result;
}

/**
 * Calculates payroll and shifts summary for a single employee for the given month
 */
export function calculateEmployeeMonthlyPayroll(
  employee: Employee,
  year: number,
  month: number,
  shifts: DayShiftInfo[]
): EmployeeMonthCalculation {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  let plannedWorkDays = 0;
  let plannedWorkedDays = 0;
  let unplannedWorkDays = 0;
  let unplannedOffDays = 0;
  let vacationDays = 0;
  let vacationUnpaidDays = 0;
  let sickDays = 0;
  let maternityDays = 0;
  let absenceDays = 0;
  let totalOffDays = 0;
  let totalWorkedHours = 0;

  for (const shift of shifts) {
    if (shift.baseStatus === 'WORK') {
      plannedWorkDays++;
    }

    switch (shift.effectiveStatus) {
      case 'WORK':
        plannedWorkedDays++;
        totalWorkedHours += shift.effectiveHours;
        break;
      case 'UNPLANNED_WORK':
        unplannedWorkDays++;
        totalWorkedHours += shift.effectiveHours;
        break;
      case 'UNPLANNED_OFF':
        unplannedOffDays++;
        totalOffDays++;
        break;
      case 'OFF':
        totalOffDays++;
        break;
      case 'VACATION':
        vacationDays++;
        break;
      case 'VACATION_UNPAID':
        vacationUnpaidDays++;
        break;
      case 'SICK':
        sickDays++;
        break;
      case 'MATERNITY':
        maternityDays++;
        break;
      case 'ABSENCE':
        absenceDays++;
        break;
    }
  }

  const actualWorkedDays = plannedWorkedDays + unplannedWorkDays;
  const dailyRate = Math.max(0, employee.dailyRate || 0);

  // Pay calculations:
  // Base pay for worked days (planned work + unplanned shifts worked)
  const basePay = actualWorkedDays * dailyRate;
  const unplannedWorkPay = unplannedWorkDays * dailyRate;

  // Sick leave pay: sickDays * dailyRate * (sickPayPercentage / 100)
  const sickPercentage = Math.max(0, Math.min(100, employee.sickPayPercentage ?? 80));
  const sickPay = Math.round(sickDays * dailyRate * (sickPercentage / 100));

  // Vacation pay: vacationDays * dailyRate * (vacationPayPercentage / 100)
  const vacationPercentage = Math.max(0, Math.min(100, employee.vacationPayPercentage ?? 100));
  const vacationPay = Math.round(vacationDays * dailyRate * (vacationPercentage / 100));

  // Maternity pay: maternityDays * dailyRate * (maternityPayPercentage / 100) + fixed monthly allowance
  const maternityPct = Math.max(0, employee.maternityPayPercentage ?? 100);
  const maternityDailyPay = Math.round(maternityDays * dailyRate * (maternityPct / 100));
  const maternityAllowance = maternityDays > 0 ? (employee.maternityMonthlyAllowance || 0) : 0;
  const maternityPay = maternityDailyPay + maternityAllowance;

  // Jubilee & Birthday calculations (starting from 50 years: 50, 55, 60, 65, 70...)
  let age: number | undefined;
  let isJubileeThisMonth = false;
  let jubileeAge: number | undefined;
  let birthdayDayOfMonth: number | undefined;

  if (employee.birthDate) {
    const parts = employee.birthDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const bYear = parts[0];
      const bMonth = parts[1];
      const bDay = parts[2];
      const turningAge = year - bYear;
      age = turningAge;
      if (bMonth === month) {
        birthdayDayOfMonth = bDay;
        if (turningAge >= 50 && turningAge % 5 === 0) {
          isJubileeThisMonth = true;
          jubileeAge = turningAge;
        }
      }
    }
  }

  // Jubilee bonus: customizable or defaults to 10 000 руб. for jubilee
  const jubileeBonus = isJubileeThisMonth
    ? (employee.jubileeBonus !== undefined ? employee.jubileeBonus : 10000)
    : 0;

  const monthlyBonus = Math.max(0, employee.monthlyBonus || 0);
  const totalPayout = basePay + sickPay + vacationPay + maternityPay + monthlyBonus + jubileeBonus;

  return {
    employeeId: employee.id,
    monthStr,
    plannedWorkDays,
    actualWorkedDays,
    plannedWorkedDays,
    unplannedWorkDays,
    unplannedOffDays,
    vacationDays,
    vacationUnpaidDays,
    sickDays,
    maternityDays,
    absenceDays,
    totalOffDays,
    totalWorkedHours,
    dailyRate,
    basePay,
    unplannedWorkPay,
    sickPay,
    vacationPay,
    maternityPay,
    monthlyBonus,
    jubileeBonus,
    totalPayout,
    age,
    isJubileeThisMonth,
    jubileeAge,
    birthdayDayOfMonth,
  };
}

/**
 * Calculates current or target age from birth date string (YYYY-MM-DD)
 */
export function getEmployeeAge(birthDate?: string, targetYear: number = 2026): number | undefined {
  if (!birthDate) return undefined;
  const parts = birthDate.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return undefined;
  return targetYear - parts[0];
}

/**
 * Checks whether an age is a milestone Jubilee starting from 50 (50, 55, 60, 65, 70, etc.)
 */
export function isJubileeAge(age: number): boolean {
  return age >= 50 && age % 5 === 0;
}

/**
 * Returns warm, official Russian congratulation greeting for jubilee
 */
export function getJubileeGreeting(
  name: string,
  age: number,
  position: string,
  department: string
): string {
  return `Глубокоуважаемый(ая) ${name}!

Сердечно поздравляем Вас со знаменательным юбилеем — ${age} лет!

Ваш многолетний добросовестный труд, верность профессии и высокий профессионализм в должности «${position}» служат примером для всего коллектива отдела «${department}». Вы заслужили искреннее уважение коллег благодаря своей душевной щедрости, ответственности и готовности всегда прийти на помощь.

В этот торжественный день примите наши самые тёплые пожелания крепкого здоровья, неиссякаемого оптимизма, семейного уюта, благополучия и долгих лет счастливой, активной жизни! Пусть каждый новый день приносит радость, гармонию и уверенность в завтрашнем дне!`;
}

/**
 * Returns all jubilee celebrants for given month and year
 */
export function getJubileesInMonth(
  employees: Employee[],
  year: number,
  month: number
): JubileeCelebration[] {
  const result: JubileeCelebration[] = [];

  for (const emp of employees) {
    if (!emp.birthDate) continue;
    const parts = emp.birthDate.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) continue;
    const [bYear, bMonth, bDay] = parts;
    const age = year - bYear;

    if (bMonth === month && isJubileeAge(age)) {
      result.push({
        employeeId: emp.id,
        employeeName: emp.name,
        position: emp.position,
        department: emp.department,
        birthDate: emp.birthDate,
        dayOfMonth: bDay,
        age,
        congratulationText: getJubileeGreeting(emp.name, age, emp.position, emp.department),
        recommendedBonus: emp.jubileeBonus !== undefined ? emp.jubileeBonus : 10000,
      });
    }
  }

  return result;
}

/**
 * Format Russian currency: e.g. 75 000 ₽
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format numbers with spaces: e.g. 1 200
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(amount);
}
