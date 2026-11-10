import React, { useState } from 'react';
import {
  Award,
  Cake,
  Calendar,
  Check,
  Copy,
  Gift,
  PartyPopper,
  Printer,
  Sparkles,
  User,
  X,
  Phone,
} from 'lucide-react';
import { Employee, JubileeCelebration } from '../types/schedule.ts';
import { formatCurrency, getJubileeGreeting, RUSSIAN_MONTHS } from '../utils/scheduleCalculator.ts';

interface JubileeCelebrationModalProps {
  jubilees: JubileeCelebration[];
  allEmployees: Employee[];
  year: number;
  month: number;
  onUpdateJubileeBonus: (employeeId: string, bonus: number) => void;
  onClose: () => void;
}

export const JubileeCelebrationModal: React.FC<JubileeCelebrationModalProps> = ({
  jubilees,
  allEmployees,
  year,
  month,
  onUpdateJubileeBonus,
  onClose,
}) => {
  const [selectedJubileeId, setSelectedJubileeId] = useState<string>(
    jubilees[0]?.employeeId || ''
  );
  const [copied, setCopied] = useState(false);
  const [bonusInput, setBonusInput] = useState<number>(() => {
    return jubilees[0]?.recommendedBonus || 10000;
  });

  const activeJubilee = jubilees.find((j) => j.employeeId === selectedJubileeId) || jubilees[0];

  // All upcoming jubilees in the current year
  const allYearJubilees = React.useMemo(() => {
    const list: Array<{
      emp: Employee;
      age: number;
      birthMonth: number;
      birthDay: number;
      isCurrentMonth: boolean;
    }> = [];

    for (const emp of allEmployees) {
      if (!emp.birthDate) continue;
      const parts = emp.birthDate.split('-').map(Number);
      if (parts.length !== 3 || isNaN(parts[0])) continue;
      const [bYear, bMonth, bDay] = parts;
      const age = year - bYear;
      if (age >= 50 && age % 5 === 0) {
        list.push({
          emp,
          age,
          birthMonth: bMonth,
          birthDay: bDay,
          isCurrentMonth: bMonth === month,
        });
      }
    }

    return list.sort((a, b) => a.birthMonth - b.birthMonth || a.birthDay - b.birthDay);
  }, [allEmployees, year, month]);

  const handleSelect = (j: JubileeCelebration) => {
    setSelectedJubileeId(j.employeeId);
    setBonusInput(j.recommendedBonus || 10000);
    setCopied(false);
  };

  const handleCopyGreeting = () => {
    if (!activeJubilee) return;
    navigator.clipboard.writeText(activeJubilee.congratulationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveBonus = () => {
    if (!activeJubilee) return;
    onUpdateJubileeBonus(activeJubilee.employeeId, bonusInput);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
            <Cake className="w-48 h-48" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
                <PartyPopper className="w-5 h-5 text-white" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                Юбиляры предприятия • от 50 лет
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Поздравление с Юбилеем ({RUSSIAN_MONTHS[month - 1]} {year})
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
              Торжественное поздравление работников, достигших круглой даты (50, 55, 60, 65, 70+ лет),
              начисление юбилейных выплат и печать поздравительного адреса
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {jubilees.length > 0 ? (
            <div>
              {/* Jubilarians Switcher (if multiple) */}
              {jubilees.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
                  {jubilees.map((j) => (
                    <button
                      key={j.employeeId}
                      type="button"
                      onClick={() => handleSelect(j)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                        j.employeeId === activeJubilee?.employeeId
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Cake className="w-3.5 h-3.5" />
                      <span>{j.employeeName}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-[11px]">
                        {j.age} лет
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeJubilee && (
                <div className="space-y-4">
                  {/* Hero Card for Selected Jubilarian */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                        {activeJubilee.age}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            {activeJubilee.employeeName}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-amber-200 text-amber-900 rounded-md">
                            Юбиляр {activeJubilee.age} лет
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {activeJubilee.position} • {activeJubilee.department}
                        </p>
                        <p className="text-xs text-amber-900 font-medium mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            День рождения: {activeJubilee.dayOfMonth} {RUSSIAN_MONTHS[month - 1]} ({activeJubilee.birthDate})
                          </span>
                        </p>
                        {activeJubilee.phone && (
                          <p className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>Телефон:</span>
                            <a
                              href={`tel:${activeJubilee.phone}`}
                              className="text-blue-700 font-bold hover:underline"
                            >
                              {activeJubilee.phone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Bonus Assignment */}
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs flex flex-col gap-1.5 sm:min-w-[200px]">
                      <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        <span>Юбилейная выплата (руб.):</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={1000}
                          min={0}
                          value={bonusInput}
                          onChange={(e) => setBonusInput(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveBonus}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition active:scale-95 whitespace-nowrap"
                        >
                          Сохранить
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Будет включена в расчётную ведомость
                      </span>
                    </div>
                  </div>

                  {/* Official Congratulatory Card & Address */}
                  <div className="bg-white border-2 border-amber-200 rounded-2xl p-5 shadow-xs space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Текст официального поздравительного адреса
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyGreeting}
                          className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Скопировано!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>Скопировать</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handlePrint}
                          className="flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-700" />
                          <span>Печать открытки</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                      {activeJubilee.congratulationText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                В месяце {RUSSIAN_MONTHS[month - 1]} {year} юбилеев нет
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Юбилеи отмечаются работниками с 50 лет (50, 55, 60, 65, 70 и т.д.).
                Ниже приведён график всех юбиляров предприятия на {year} год.
              </p>
            </div>
          )}

          {/* All Jubilarians in the current calendar year */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Все юбиляры предприятия в {year} году (от 50 лет)</span>
            </h4>

            {allYearJubilees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {allYearJubilees.map(({ emp, age, birthMonth, birthDay, isCurrentMonth }) => (
                  <div
                    key={emp.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                      isCurrentMonth
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCurrentMonth
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {age}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {emp.position} • {emp.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-semibold text-slate-800">
                        {birthDay} {RUSSIAN_MONTHS[birthMonth - 1]}
                      </div>
                      {isCurrentMonth ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-bold bg-amber-200 text-amber-900 rounded">
                          В этом месяце!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">{emp.birthDate}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Нет сотрудников с заполненной датой рождения от 50 лет.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Юбилейные премии и поздравления формируются автоматически
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
