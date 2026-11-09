export type SchedulePatternType = 
  | '2/2' 
  | '5/2' 
  | '3/3' 
  | '1/3' 
  | '4/2' 
  | '6/1' 
  | 'custom';

export type ShiftStatus = 
  | 'WORK'             // Плановая рабочая смена (Р)
  | 'OFF'              // Плановый выходной (В)
  | 'UNPLANNED_OFF'    // Внеплановый выходной (ВВ)
  | 'UNPLANNED_WORK'   // Внеплановая рабочая смена / выход в свой выходной (ВР)
  | 'VACATION'         // Ежегодный оплачиваемый отпуск (ОТ)
  | 'VACATION_UNPAID'  // Отпуск без сохранения зарплаты (ДО)
  | 'SICK'             // Больничный лист (Б)
  | 'ABSENCE';         // Прогул / неявка (ПР)

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  dailyRate: number;            // Ставка за 1 рабочий день (руб.)
  shiftHours: number;           // Стандартные часы смены (8, 12, 24 и т.д.)
  scheduleType: SchedulePatternType;
  customWorkDays?: number;      // Если custom: сколько рабочих дней подряд
  customOffDays?: number;       // Если custom: сколько выходных дней подряд
  cycleStartDate: string;       // Дата отсчёта графика (YYYY-MM-DD)
  sickPayPercentage: number;    // % оплаты больничного (например 80% или 100%)
  vacationPayPercentage: number;// % оплаты отпускного дня (обычно 100%)
  monthlyBonus: number;         // Премия за месяц (руб.)
  avatarColor: string;
  active: boolean;
}

export interface ShiftOverride {
  employeeId: string;
  date: string;                 // YYYY-MM-DD
  status: ShiftStatus;
  customHours?: number;
  note?: string;
}

export interface DayShiftInfo {
  date: string;                 // YYYY-MM-DD
  dayNumber: number;            // 1..31
  dayOfWeek: number;            // 0=Sun, 1=Mon, ..., 6=Sat
  dayName: string;              // Пн, Вт, Ср, ...
  isCalendarWeekend: boolean;   // Сб или Вс
  baseStatus: 'WORK' | 'OFF';   // Базовый график без переопределений
  effectiveStatus: ShiftStatus; // Итоговый статус с учётом отпуска/больничного/внепланового
  effectiveHours: number;       // Отработанные часы (если рабочий день)
  isOverridden: boolean;        // Был ли изменён статус вручную
  overrideNote?: string;
}

export interface EmployeeMonthCalculation {
  employeeId: string;
  monthStr: string;             // YYYY-MM
  plannedWorkDays: number;      // Сколько смен положено по графику
  actualWorkedDays: number;     // Сколько фактически отработано (план + внеплан)
  plannedWorkedDays: number;    // Из них плановых отработанных
  unplannedWorkDays: number;    // Внеплановые рабочие смены (выходы в выходной)
  unplannedOffDays: number;     // Внеплановые выходные (отгулы)
  vacationDays: number;         // Дни оплачиваемого отпуска
  vacationUnpaidDays: number;   // Дни отпуска без оплаты
  sickDays: number;             // Дни больничного
  absenceDays: number;          // Прогулы
  totalOffDays: number;         // Всего выходных дней
  totalWorkedHours: number;     // Сумма часов
  
  // Финансы
  dailyRate: number;            // Текущая ставка за день
  basePay: number;              // Оплата за отработанные дни (actualWorkedDays * dailyRate)
  unplannedWorkPay: number;     // Доплата за внеплановые смены (включена или доп. бонус)
  sickPay: number;              // Оплата больничного (дни * ставка * %/100)
  vacationPay: number;          // Оплата отпуска (дни * ставка * %/100)
  monthlyBonus: number;         // Премия
  totalPayout: number;          // ИТОГО к выплате
}

export interface StatusMeta {
  code: string;
  label: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  isPaidWork: boolean;
  isPaidSpecial: boolean;
  description: string;
}
