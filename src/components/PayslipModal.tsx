import React from 'react';
import { X, Printer, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { Employee, EmployeeMonthCalculation, DayShiftInfo } from '../types/schedule.ts';
import { formatCurrency, RUSSIAN_MONTHS } from '../utils/scheduleCalculator.ts';

interface PayslipModalProps {
  employee: Employee;
  payroll: EmployeeMonthCalculation;
  shifts: DayShiftInfo[];
  year: number;
  month: number;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  employee,
  payroll,
  shifts,
  year,
  month,
  onClose,
}) => {
  const monthName = RUSSIAN_MONTHS[month - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Расчётный листок за {monthName} {year} г.
              </h3>
              <p className="text-xs text-slate-500">
                Детализированный расчёт заработной платы и компенсаций
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Печать</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Paper Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Employee & Info Header */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Сотрудник:</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{employee.name}</strong>
              <span className="text-slate-600 mt-1 block">
                Должность: <strong className="text-slate-800">{employee.position}</strong>
              </span>
              <span className="text-slate-600 block">
                Подразделение: <strong className="text-slate-800">{employee.department}</strong>
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">Период начисления:</span>
              <strong className="text-blue-700 text-sm block mt-0.5">{monthName} {year} г.</strong>
              <span className="text-slate-600 mt-1 block">
                График: <strong className="text-slate-800">{employee.scheduleType} ({employee.shiftHours}ч/см)</strong>
              </span>
              <span className="text-slate-600 block">
                Дневная ставка: <strong className="text-emerald-700">{formatCurrency(payroll.dailyRate)}</strong>
              </span>
            </div>
          </div>

          {/* Time and Shifts Balance */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Баланс рабочего времени за месяц:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Плановых смен:</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{payroll.plannedWorkDays} смен</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Фактически отработано:</span>
                <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                  {payroll.actualWorkedDays} смен
                </span>
                <span className="text-[10px] text-slate-500">({payroll.totalWorkedHours} часов)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Больничных дней:</span>
                <span className="text-base font-bold text-rose-700 mt-0.5 block">{payroll.sickDays} дней</span>
                <span className="text-[10px] text-slate-500">(оплата {employee.sickPayPercentage}%)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Дней отпуска:</span>
                <span className="text-base font-bold text-teal-700 mt-0.5 block">{payroll.vacationDays} дней</span>
                <span className="text-[10px] text-slate-500">(оплата {employee.vacationPayPercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Detailed Itemized Pay Calculation Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Расшифровка начислений (Формула расчёта):
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Вид начисления</th>
                    <th className="py-2.5 px-3 text-center">Дни / Смены</th>
                    <th className="py-2.5 px-3 text-center">Ставка / Тариф</th>
                    <th className="py-2.5 px-3 text-center">Формула расчёта</th>
                    <th className="py-2.5 px-3 text-right">Начислено</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {/* Base Worked Shifts */}
                  <tr>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900">Оплата за отработанные смены</span>
                      <span className="block text-[10px] text-slate-500">
                        {payroll.plannedWorkedDays} план. смен + {payroll.unplannedWorkDays} внеплан.
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {payroll.actualWorkedDays} смен
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {formatCurrency(payroll.dailyRate)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                      {payroll.actualWorkedDays} × {payroll.dailyRate} ₽
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(payroll.basePay)}
                    </td>
                  </tr>

                  {/* Sick Leave Compensation */}
                  {payroll.sickDays > 0 && (
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-rose-700">Оплата по больничному листу</span>
                        <span className="block text-[10px] text-slate-500">
                          Пособие по временной нетрудоспособности ({employee.sickPayPercentage}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-700">
                        {payroll.sickDays} дн.
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {formatCurrency(payroll.dailyRate)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {payroll.sickDays} × {payroll.dailyRate} ₽ × {employee.sickPayPercentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                        {formatCurrency(payroll.sickPay)}
                      </td>
                    </tr>
                  )}

                  {/* Vacation Compensation */}
                  {payroll.vacationDays > 0 && (
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-teal-700">Оплата ежегодного отпуска</span>
                        <span className="block text-[10px] text-slate-500">
                          Очередной оплачиваемый отпуск ({employee.vacationPayPercentage}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-teal-700">
                        {payroll.vacationDays} дн.
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {formatCurrency(payroll.dailyRate)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {payroll.vacationDays} × {payroll.dailyRate} ₽ × {employee.vacationPayPercentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-teal-700">
                        {formatCurrency(payroll.vacationPay)}
                      </td>
                    </tr>
                  )}

                  {/* Maternity Pay */}
                  {payroll.maternityDays > 0 && (
                    <tr className="bg-purple-50/40">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-purple-900">Декретный отпуск / Пособие (БиР и уход)</span>
                        <span className="block text-[10px] text-purple-700">
                          Отпуск по беременности и родам / по уходу за ребёнком
                          {employee.maternityMonthlyAllowance ? ` + пособие ${formatCurrency(employee.maternityMonthlyAllowance)}` : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-purple-800">
                        {payroll.maternityDays} дн.
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">
                        {formatCurrency(payroll.dailyRate)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {payroll.maternityDays} × {payroll.dailyRate} ₽ × {employee.maternityPayPercentage ?? 100}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-purple-800">
                        {formatCurrency(payroll.maternityPay)}
                      </td>
                    </tr>
                  )}

                  {/* Monthly Bonus */}
                  {payroll.monthlyBonus > 0 && (
                    <tr>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-amber-800">Премиальное вознаграждение</span>
                        <span className="block text-[10px] text-slate-500">
                          Персональная премия
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        Фиксированная премия
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-800">
                        {formatCurrency(payroll.monthlyBonus)}
                      </td>
                    </tr>
                  )}

                  {/* Jubilee Bonus */}
                  {payroll.jubileeBonus > 0 && (
                    <tr className="bg-amber-50/60">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <span>🎂 Единовременная выплата к Юбилею</span>
                        </span>
                        <span className="block text-[10px] text-amber-800">
                          В честь празднования {payroll.jubileeAge || payroll.age} лет со дня рождения
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-900 font-bold">Юбилей</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">-</td>
                      <td className="py-2.5 px-3 text-center text-amber-900 font-mono text-[11px]">
                        Круглая дата {payroll.jubileeAge} лет
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-amber-900">
                        {formatCurrency(payroll.jubileeBonus)}
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-800 text-sm">
                      ИТОГО К ВЫПЛАТЕ:
                    </td>
                    <td className="py-3 px-3 text-right text-base text-emerald-700 font-extrabold">
                      {formatCurrency(payroll.totalPayout)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Verification seal */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Расчёт произведён автоматически на основе табеля смен</span>
            </div>
            <span>Расчётный отдел / Бухгалтерия</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Закрыть расчётный листок
          </button>
        </div>
      </div>
    </div>
  );
};
