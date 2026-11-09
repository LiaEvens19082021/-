using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;

namespace ShiftScheduleCSharp
{
    public enum ShiftStatus
    {
        Work,              // Р - Плановая смена
        Off,               // В - Плановый выходной
        UnplannedOff,      // ВВ - Внеплановый выходной
        UnplannedWork,     // ВР - Внеплановая рабочая смена
        Vacation,          // ОТ - Оплачиваемый отпуск
        VacationUnpaid,    // ДО - Отпуск за свой счёт
        Sick,              // Б - Больничный лист
        Absence            // ПР - Прогул / неявка
    }

    public enum ScheduleType
    {
        TwoTwo,      // 2/2
        FiveTwo,     // 5/2
        OneThree,    // 1/3 (сутки через трое)
        ThreeThree,  // 3/3
        SixOne       // 6/1
    }

    public class Employee
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = "";
        public string Position { get; set; } = "";
        public string Department { get; set; } = "";
        public decimal DailyRate { get; set; }
        public ScheduleType Schedule { get; set; }
        public int ShiftHours { get; set; } = 12;
        public DateTime AnchorDate { get; set; } = new DateTime(2026, 1, 1);
        public decimal MonthlyBonus { get; set; } = 0;
        public decimal SickLeaveCompensationPercent { get; set; } = 80;
        public decimal VacationCompensationPercent { get; set; } = 100;
    }

    public class ShiftOverride
    {
        public ShiftStatus Status { get; set; }
        public int Hours { get; set; }
        public string Note { get; set; } = "";
    }

    public class DayShiftInfo
    {
        public DateTime Date { get; set; }
        public ShiftStatus BaseStatus { get; set; }
        public ShiftStatus EffectiveStatus { get; set; }
        public int Hours { get; set; }
        public bool IsOverride { get; set; }
        public string Note { get; set; } = "";
    }

    public class PayrollResult
    {
        public Employee Employee { get; set; } = null!;
        public int PlannedShifts { get; set; }
        public int ActualWorkedShifts { get; set; }
        public int UnplannedWorkedShifts { get; set; }
        public int SickDays { get; set; }
        public int VacationDays { get; set; }
        public int TotalHours { get; set; }
        public decimal BasePay { get; set; }
        public decimal SickPay { get; set; }
        public decimal VacationPay { get; set; }
        public decimal BonusPay { get; set; }
        public decimal TotalPayout => BasePay + SickPay + VacationPay + BonusPay;
    }

    public static class ScheduleEngine
    {
        public static ShiftStatus GetBaseStatus(Employee emp, DateTime date)
        {
            switch (emp.Schedule)
            {
                case ScheduleType.FiveTwo:
                    // Пн-Пт рабочие, Сб-Вс выходные
                    return (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                        ? ShiftStatus.Off
                        : ShiftStatus.Work;

                case ScheduleType.TwoTwo:
                    // Цикл 4 дня: 2 раб, 2 вых
                    var diff2 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    var mod2 = ((diff2 % 4) + 4) % 4;
                    return (mod2 == 0 || mod2 == 1) ? ShiftStatus.Work : ShiftStatus.Off;

                case ScheduleType.OneThree:
                    // Цикл 4 дня: 1 раб (сутки), 3 вых
                    var diff1 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    var mod1 = ((diff1 % 4) + 4) % 4;
                    return mod1 == 0 ? ShiftStatus.Work : ShiftStatus.Off;

                case ScheduleType.ThreeThree:
                    // Цикл 6 дней: 3 раб, 3 вых
                    var diff3 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    var mod3 = ((diff3 % 6) + 6) % 6;
                    return mod3 < 3 ? ShiftStatus.Work : ShiftStatus.Off;

                case ScheduleType.SixOne:
                    return date.DayOfWeek == DayOfWeek.Sunday ? ShiftStatus.Off : ShiftStatus.Work;

                default:
                    return ShiftStatus.Work;
            }
        }

        public static List<DayShiftInfo> CalculateMonthShifts(
            Employee emp,
            int year,
            int month,
            Dictionary<string, ShiftOverride> overrides)
        {
            var result = new List<DayShiftInfo>();
            int days = DateTime.DaysInMonth(year, month);

            for (int day = 1; day <= days; day++)
            {
                var date = new DateTime(year, month, day);
                var baseStatus = GetBaseStatus(emp, date);
                var key = $"{emp.Id}_{date:yyyy-MM-dd}";

                if (overrides.TryGetValue(key, out var ov))
                {
                    result.Add(new DayShiftInfo
                    {
                        Date = date,
                        BaseStatus = baseStatus,
                        EffectiveStatus = ov.Status,
                        Hours = ov.Hours,
                        IsOverride = true,
                        Note = ov.Note
                    });
                }
                else
                {
                    result.Add(new DayShiftInfo
                    {
                        Date = date,
                        BaseStatus = baseStatus,
                        EffectiveStatus = baseStatus,
                        Hours = baseStatus == ShiftStatus.Work ? emp.ShiftHours : 0,
                        IsOverride = false,
                        Note = ""
                    });
                }
            }

            return result;
        }

        public static PayrollResult CalculatePayroll(
            Employee emp,
            List<DayShiftInfo> shifts)
        {
            int planned = shifts.Count(s => s.BaseStatus == ShiftStatus.Work);
            int actual = shifts.Count(s => s.EffectiveStatus == ShiftStatus.Work || s.EffectiveStatus == ShiftStatus.UnplannedWork);
            int unplanned = shifts.Count(s => s.EffectiveStatus == ShiftStatus.UnplannedWork);
            int sickDays = shifts.Count(s => s.EffectiveStatus == ShiftStatus.Sick);
            int vacationDays = shifts.Count(s => s.EffectiveStatus == ShiftStatus.Vacation);
            int totalHours = shifts.Sum(s => s.Hours);

            decimal basePay = actual * emp.DailyRate;
            decimal sickPay = sickDays * emp.DailyRate * (emp.SickLeaveCompensationPercent / 100m);
            decimal vacationPay = vacationDays * emp.DailyRate * (emp.VacationCompensationPercent / 100m);

            return new PayrollResult
            {
                Employee = emp,
                PlannedShifts = planned,
                ActualWorkedShifts = actual,
                UnplannedWorkedShifts = unplanned,
                SickDays = sickDays,
                VacationDays = vacationDays,
                TotalHours = totalHours,
                BasePay = basePay,
                SickPay = sickPay,
                VacationPay = vacationPay,
                BonusPay = emp.MonthlyBonus
            };
        }
    }

    internal class Program
    {
        private static readonly List<Employee> Employees = new()
        {
            new Employee
            {
                Id = "emp-1",
                Name = "Иванов Алексей Петрович",
                Position = "Старший сменный мастер",
                Department = "Производство",
                DailyRate = 4500,
                Schedule = ScheduleType.TwoTwo,
                ShiftHours = 12,
                AnchorDate = new DateTime(2026, 11, 1),
                MonthlyBonus = 5000
            },
            new Employee
            {
                Id = "emp-2",
                Name = "Смирнова Екатерина Михайловна",
                Position = "Оператор производственной линии",
                Department = "Производство",
                DailyRate = 3600,
                Schedule = ScheduleType.TwoTwo,
                ShiftHours = 12,
                AnchorDate = new DateTime(2026, 11, 3)
            },
            new Employee
            {
                Id = "emp-3",
                Name = "Кузнецов Дмитрий Сергеевич",
                Position = "Дежурный инженер КИПиА",
                Department = "Служба эксплуатации",
                DailyRate = 5200,
                Schedule = ScheduleType.OneThree,
                ShiftHours = 24,
                AnchorDate = new DateTime(2026, 11, 1)
            },
            new Employee
            {
                Id = "emp-4",
                Name = "Морозова Анна Владимировна",
                Position = "Бухгалтер-экономист",
                Department = "Финансовый отдел",
                DailyRate = 4200,
                Schedule = ScheduleType.FiveTwo,
                ShiftHours = 8
            },
            new Employee
            {
                Id = "emp-5",
                Name = "Васильев Роман Андреевич",
                Position = "Кладовщик-комплектовщик",
                Department = "Логистика",
                DailyRate = 3400,
                Schedule = ScheduleType.ThreeThree,
                ShiftHours = 10,
                AnchorDate = new DateTime(2026, 11, 1)
            },
            new Employee
            {
                Id = "emp-6",
                Name = "Попова Ольга Николаевна",
                Position = "Менеджер по отгрузкам",
                Department = "Логистика",
                DailyRate = 3800,
                Schedule = ScheduleType.FiveTwo,
                ShiftHours = 8,
                MonthlyBonus = 7000
            }
        };

        private static readonly Dictionary<string, ShiftOverride> Overrides = new()
        {
            // Внеплановая смена мастера
            ["emp-1_2026-11-07"] = new ShiftOverride { Status = ShiftStatus.UnplannedWork, Hours = 12, Note = "Замена" },
            // Внеплановый выходной оператора
            ["emp-2_2026-11-12"] = new ShiftOverride { Status = ShiftStatus.UnplannedOff, Hours = 0, Note = "Семейные обстоятельства" },
            // Больничный бухгалтера
            ["emp-4_2026-11-10"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Лист нетрудоспособности" },
            ["emp-4_2026-11-11"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Лист нетрудоспособности" },
            ["emp-4_2026-11-12"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Лист нетрудоспособности" },
            ["emp-4_2026-11-13"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Лист нетрудоспособности" }
        };

        private static int _currentYear = 2026;
        private static int _currentMonth = 11;

        public static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.InputEncoding = Encoding.UTF8;

            while (true)
            {
                Console.Clear();
                PrintHeader();
                Console.WriteLine("  [1] Показать табель смен за текущий месяц (Ноябрь 2026)");
                Console.WriteLine("  [2] Показать итоговый расчёт заработной платы");
                Console.WriteLine("  [3] Изменить дневную ставку сотрудника");
                Console.WriteLine("  [4] Изменить график работы сотрудника (2/2, 5/2, 1/3, 3/3)");
                Console.WriteLine("  [5] Добавить внеплановый выходной или смену");
                Console.WriteLine("  [6] Оформить больничный или отпуск");
                Console.WriteLine("  [7] Запустить визуальный веб-интерфейс в браузере (http://localhost:3000)");
                Console.WriteLine("  [0] Выход из программы");
                Console.WriteLine();
                Console.Write("  Выберите пункт меню (0-7): ");

                var input = Console.ReadLine()?.Trim();
                switch (input)
                {
                    case "1":
                        ShowScheduleMatrix();
                        break;
                    case "2":
                        ShowPayrollTable();
                        break;
                    case "3":
                        ChangeDailyRate();
                        break;
                    case "4":
                        ChangeScheduleType();
                        break;
                    case "5":
                        AddShiftOverride();
                        break;
                    case "6":
                        AddAbsencePeriod();
                        break;
                    case "7":
                        LaunchBrowserApp();
                        break;
                    case "0":
                        Console.WriteLine("\n  Завершение работы программы. Всего доброго!");
                        return;
                    default:
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("  Некорректный ввод. Нажмите Enter...");
                        Console.ResetColor();
                        Console.ReadLine();
                        break;
                }
            }
        }

        private static void PrintHeader()
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================================================");
            Console.WriteLine($"   ГРАФИК СМЕН И АВТОМАТИЧЕСКИЙ РАСЧЁТ ЗАРПЛАТЫ (C# .NET / Visual Studio)");
            Console.WriteLine($"   Расчётный период: {_currentMonth:D2}.{_currentYear} | Сотрудников: {Employees.Count}");
            Console.WriteLine("==================================================================================");
            Console.ResetColor();
            Console.WriteLine();
        }

        private static void ShowPayrollTable()
        {
            Console.Clear();
            PrintHeader();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($" РАСЧЁТНАЯ ВЕДОМОСТЬ ЗА {_currentMonth:D2}.{_currentYear}:");
            Console.ResetColor();
            Console.WriteLine(new string('-', 100));
            Console.WriteLine("{0,-28} | {1,-6} | {2,-6} | {3,10} | {4,10} | {5,10} | {6,10} | {7,12}",
                "ФИО сотрудника", "Смены", "Часы", "Ставка/дн", "Оклад", "Больн.", "Отпуск", "ИТОГО");
            Console.WriteLine(new string('-', 100));

            decimal totalFund = 0;
            int totalShifts = 0;

            foreach (var emp in Employees)
            {
                var shifts = ScheduleEngine.CalculateMonthShifts(emp, _currentYear, _currentMonth, Overrides);
                var pay = ScheduleEngine.CalculatePayroll(emp, shifts);
                totalFund += pay.TotalPayout;
                totalShifts += pay.ActualWorkedShifts;

                Console.WriteLine("{0,-28} | {1,2}/{2,-3} | {3,5}ч | {4,9:N0} ₽ | {5,9:N0} ₽ | {6,9:N0} ₽ | {7,9:N0} ₽ | {8,10:N0} ₽",
                    emp.Name.Length > 28 ? emp.Name[..25] + "..." : emp.Name,
                    pay.ActualWorkedShifts,
                    pay.PlannedShifts,
                    pay.TotalHours,
                    emp.DailyRate,
                    pay.BasePay,
                    pay.SickPay,
                    pay.VacationPay,
                    pay.TotalPayout);
            }

            Console.WriteLine(new string('=', 100));
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($" ВСЕГО: Отработано {totalShifts} смен. ОБЩИЙ ФОНД ЗАРПЛАТЫ: {totalFund:N0} руб.");
            Console.ResetColor();
            Console.WriteLine("\n Нажмите Enter, чтобы вернуться в меню...");
            Console.ReadLine();
        }

        private static void ShowScheduleMatrix()
        {
            Console.Clear();
            PrintHeader();
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine($" ТАБЕЛЬ СМЕН (1-15 числа месяца {_currentMonth:D2}.{_currentYear}):");
            Console.ResetColor();
            Console.WriteLine(new string('-', 90));
            Console.Write("{0,-24} |", "Сотрудник / График");
            for (int d = 1; d <= 15; d++)
            {
                Console.Write("{0,4}", d);
            }
            Console.WriteLine(" | Отраб.");
            Console.WriteLine(new string('-', 90));

            foreach (var emp in Employees)
            {
                var shifts = ScheduleEngine.CalculateMonthShifts(emp, _currentYear, _currentMonth, Overrides);
                string title = $"{emp.Name.Split(' ')[0]} ({emp.Schedule})";
                Console.Write("{0,-24} |", title.Length > 24 ? title[..24] : title);

                for (int d = 1; d <= 15; d++)
                {
                    var s = shifts[d - 1];
                    string code = s.EffectiveStatus switch
                    {
                        ShiftStatus.Work => " Р ",
                        ShiftStatus.Off => " . ",
                        ShiftStatus.UnplannedWork => "ВР ",
                        ShiftStatus.UnplannedOff => "ВВ ",
                        ShiftStatus.Sick => " Б ",
                        ShiftStatus.Vacation => "ОТ ",
                        _ => " ? "
                    };

                    if (s.IsOverride)
                    {
                        Console.ForegroundColor = ConsoleColor.Cyan;
                        Console.Write("{0,4}", code);
                        Console.ResetColor();
                    }
                    else if (s.EffectiveStatus == ShiftStatus.Work)
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.Write("{0,4}", code);
                        Console.ResetColor();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.DarkGray;
                        Console.Write("{0,4}", code);
                        Console.ResetColor();
                    }
                }

                var pay = ScheduleEngine.CalculatePayroll(emp, shifts);
                Console.WriteLine($" | {pay.ActualWorkedShifts,2} смен");
            }

            Console.WriteLine(new string('-', 90));
            Console.WriteLine(" Обозначения: Р = Рабочая смена, . = Выходной, ВР = Внеплановая смена, Б = Больничный, ОТ = Отпуск");
            Console.WriteLine("\n Нажмите Enter, чтобы вернуться в меню...");
            Console.ReadLine();
        }

        private static void ChangeDailyRate()
        {
            Console.Clear();
            PrintHeader();
            Console.WriteLine(" Выберите сотрудника для изменения дневной ставки:");
            for (int i = 0; i < Employees.Count; i++)
            {
                Console.WriteLine($"  [{i + 1}] {Employees[i].Name} (Текущая ставка: {Employees[i].DailyRate:N0} ₽/день)");
            }
            Console.Write("\n Номер сотрудника (или 0 для отмены): ");
            if (int.TryParse(Console.ReadLine(), out int idx) && idx >= 1 && idx <= Employees.Count)
            {
                var emp = Employees[idx - 1];
                Console.Write($" Введите новую ставку за 1 рабочий день для {emp.Name} (руб.): ");
                if (decimal.TryParse(Console.ReadLine(), out decimal newRate) && newRate > 0)
                {
                    emp.DailyRate = newRate;
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"\n [УСПЕШНО] Новая ставка установлена: {emp.DailyRate:N0} руб./день.");
                    Console.WriteLine(" Зарплата за текущий месяц автоматически пересчитана!");
                    Console.ResetColor();
                }
            }
            Console.WriteLine("\n Нажмите Enter...");
            Console.ReadLine();
        }

        private static void ChangeScheduleType()
        {
            Console.Clear();
            PrintHeader();
            Console.WriteLine(" Выберите сотрудника для смены графика:");
            for (int i = 0; i < Employees.Count; i++)
            {
                Console.WriteLine($"  [{i + 1}] {Employees[i].Name} (Текущий график: {Employees[i].Schedule})");
            }
            Console.Write("\n Номер сотрудника: ");
            if (int.TryParse(Console.ReadLine(), out int idx) && idx >= 1 && idx <= Employees.Count)
            {
                var emp = Employees[idx - 1];
                Console.WriteLine("\n Доступные графики:");
                Console.WriteLine("  [1] 2/2 (2 рабочих, 2 выходных по 12ч)");
                Console.WriteLine("  [2] 5/2 (пятидневка по 8ч)");
                Console.WriteLine("  [3] 1/3 (сутки через трое по 24ч)");
                Console.WriteLine("  [4] 3/3 (3 рабочих, 3 выходных по 10ч)");
                Console.Write(" Выберите график: ");
                var choice = Console.ReadLine();
                switch (choice)
                {
                    case "1":
                        emp.Schedule = ScheduleType.TwoTwo;
                        emp.ShiftHours = 12;
                        break;
                    case "2":
                        emp.Schedule = ScheduleType.FiveTwo;
                        emp.ShiftHours = 8;
                        break;
                    case "3":
                        emp.Schedule = ScheduleType.OneThree;
                        emp.ShiftHours = 24;
                        break;
                    case "4":
                        emp.Schedule = ScheduleType.ThreeThree;
                        emp.ShiftHours = 10;
                        break;
                }
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"\n [УСПЕШНО] Сотруднику {emp.Name} назначен график {emp.Schedule} ({emp.ShiftHours}ч).");
                Console.ResetColor();
            }
            Console.WriteLine("\n Нажмите Enter...");
            Console.ReadLine();
        }

        private static void AddShiftOverride()
        {
            Console.Clear();
            PrintHeader();
            Console.WriteLine(" Добавление внеплановой смены или внепланового выходного:");
            for (int i = 0; i < Employees.Count; i++)
            {
                Console.WriteLine($"  [{i + 1}] {Employees[i].Name}");
            }
            Console.Write(" Номер сотрудника: ");
            if (int.TryParse(Console.ReadLine(), out int idx) && idx >= 1 && idx <= Employees.Count)
            {
                var emp = Employees[idx - 1];
                Console.Write($" Введите число месяца (1-{DateTime.DaysInMonth(_currentYear, _currentMonth)}): ");
                if (int.TryParse(Console.ReadLine(), out int day) && day >= 1 && day <= 30)
                {
                    Console.WriteLine(" Выберите тип переопределения:");
                    Console.WriteLine("  [1] Внеплановая рабочая смена (ВР) - переработка / выход на замену");
                    Console.WriteLine("  [2] Внеплановый выходной (ВВ) - отгул / по согласованию");
                    Console.Write(" Выбор: ");
                    var type = Console.ReadLine();
                    var key = $"{emp.Id}_{_currentYear:D4}-{_currentMonth:D2}-{day:D2}";

                    if (type == "1")
                    {
                        Overrides[key] = new ShiftOverride
                        {
                            Status = ShiftStatus.UnplannedWork,
                            Hours = emp.ShiftHours,
                            Note = "Внеплановый выход на смену"
                        };
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine($"\n [УСПЕШНО] {day}.{_currentMonth}.{_currentYear} назначена внеплановая смена!");
                        Console.ResetColor();
                    }
                    else if (type == "2")
                    {
                        Overrides[key] = new ShiftOverride
                        {
                            Status = ShiftStatus.UnplannedOff,
                            Hours = 0,
                            Note = "Внеплановый выходной"
                        };
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine($"\n [УСПЕШНО] {day}.{_currentMonth}.{_currentYear} назначен внеплановый выходной!");
                        Console.ResetColor();
                    }
                }
            }
            Console.WriteLine("\n Нажмите Enter...");
            Console.ReadLine();
        }

        private static void AddAbsencePeriod()
        {
            Console.Clear();
            PrintHeader();
            Console.WriteLine(" Оформление отпуска или больничного:");
            for (int i = 0; i < Employees.Count; i++)
            {
                Console.WriteLine($"  [{i + 1}] {Employees[i].Name}");
            }
            Console.Write(" Номер сотрудника: ");
            if (int.TryParse(Console.ReadLine(), out int idx) && idx >= 1 && idx <= Employees.Count)
            {
                var emp = Employees[idx - 1];
                Console.WriteLine(" Выберите тип:");
                Console.WriteLine("  [1] Больничный лист (компенсация 80%)");
                Console.WriteLine("  [2] Ежегодный оплачиваемый отпуск (компенсация 100%)");
                var typeChoice = Console.ReadLine();
                var status = typeChoice == "1" ? ShiftStatus.Sick : ShiftStatus.Vacation;

                Console.Write(" Начальный день (число): ");
                int.TryParse(Console.ReadLine(), out int startDay);
                Console.Write(" Конечный день (число): ");
                int.TryParse(Console.ReadLine(), out int endDay);

                if (startDay >= 1 && endDay >= startDay && endDay <= 30)
                {
                    for (int d = startDay; d <= endDay; d++)
                    {
                        var key = $"{emp.Id}_{_currentYear:D4}-{_currentMonth:D2}-{d:D2}";
                        Overrides[key] = new ShiftOverride
                        {
                            Status = status,
                            Hours = 0,
                            Note = status == ShiftStatus.Sick ? "Больничный лист" : "Очередной отпуск"
                        };
                    }

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"\n [УСПЕШНО] Период с {startDay} по {endDay} ноября оформлен как {(status == ShiftStatus.Sick ? "больничный" : "отпуск")}!");
                    Console.ResetColor();
                }
            }
            Console.WriteLine("\n Нажмите Enter...");
            Console.ReadLine();
        }

        private static void LaunchBrowserApp()
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("\n Открытие визуального интерфейса...");
            Console.ResetColor();
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3000",
                    UseShellExecute = true
                });
                Console.WriteLine(" Страница открыта в браузере: http://localhost:3000");
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Не удалось открыть браузер автоматически: {ex.Message}");
                Console.WriteLine(" Откройте вручную ссылку: http://localhost:3000");
            }
            Console.WriteLine("\n Нажмите Enter...");
            Console.ReadLine();
        }
    }
}
