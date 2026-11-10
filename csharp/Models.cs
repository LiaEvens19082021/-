using System;
using System.Collections.Generic;
using System.Linq;

namespace ShiftScheduleApp
{
    public enum ShiftStatus
    {
        Work,              // Р - Плановая смена
        Off,               // В - Плановый выходной
        UnplannedOff,      // ВВ - Внеплановый выходной (отгул)
        UnplannedWork,     // ВР - Внеплановая рабочая смена
        Vacation,          // ОТ - Оплачиваемый отпуск
        VacationUnpaid,    // ДО - Отпуск без сохранения зарплаты
        Sick,              // Б - Больничный лист
        Maternity,         // Д - Декретный отпуск (БиР / уход за ребенком)
        Absence            // ПР - Прогул / неявка
    }

    public enum ScheduleType
    {
        TwoTwo,      // 2/2 (2 рабочих по 12ч, 2 выходных)
        FiveTwo,     // 5/2 (пятидневка по 8ч)
        OneThree,    // 1/3 (сутки через трое по 24ч)
        ThreeThree,  // 3/3 (3 рабочих по 10ч, 3 выходных)
        SixOne       // 6/1
    }

    public class Employee
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public string Phone { get; set; }
        public decimal DailyRate { get; set; }
        public ScheduleType Schedule { get; set; }
        public int ShiftHours { get; set; }
        public DateTime AnchorDate { get; set; }
        public DateTime? BirthDate { get; set; }
        public decimal MonthlyBonus { get; set; }
        public decimal JubileeBonus { get; set; }
        public decimal SickLeaveCompensationPercent { get; set; }
        public decimal VacationCompensationPercent { get; set; }
        public decimal MaternityPayPercent { get; set; }
        public decimal MaternityMonthlyAllowance { get; set; }

        public Employee()
        {
            Id = Guid.NewGuid().ToString();
            Name = "";
            Position = "";
            Department = "";
            Phone = "";
            DailyRate = 3500;
            Schedule = ScheduleType.TwoTwo;
            ShiftHours = 12;
            AnchorDate = new DateTime(2026, 11, 1);
            BirthDate = null;
            MonthlyBonus = 0;
            JubileeBonus = 0;
            SickLeaveCompensationPercent = 80;
            VacationCompensationPercent = 100;
            MaternityPayPercent = 100;
            MaternityMonthlyAllowance = 0;
        }
    }

    public class ShiftOverride
    {
        public ShiftStatus Status { get; set; }
        public int Hours { get; set; }
        public string Note { get; set; }

        public ShiftOverride()
        {
            Status = ShiftStatus.Work;
            Hours = 8;
            Note = "";
        }
    }

    public class DayShiftInfo
    {
        public DateTime Date { get; set; }
        public ShiftStatus BaseStatus { get; set; }
        public ShiftStatus EffectiveStatus { get; set; }
        public int Hours { get; set; }
        public bool IsOverride { get; set; }
        public string Note { get; set; }

        public DayShiftInfo()
        {
            Date = DateTime.Today;
            BaseStatus = ShiftStatus.Off;
            EffectiveStatus = ShiftStatus.Off;
            Hours = 0;
            IsOverride = false;
            Note = "";
        }
    }

    public class JubileeInfo
    {
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public string Phone { get; set; }
        public DateTime BirthDate { get; set; }
        public int Age { get; set; }
        public decimal Bonus { get; set; }
        public string CongratulationText { get; set; }
    }

    public class PayrollResult
    {
        public Employee Employee { get; set; }
        public int PlannedShifts { get; set; }
        public int ActualWorkedShifts { get; set; }
        public int UnplannedWorkedShifts { get; set; }
        public int SickDays { get; set; }
        public int VacationDays { get; set; }
        public int MaternityDays { get; set; }
        public int TotalHours { get; set; }
        public decimal BasePay { get; set; }
        public decimal SickPay { get; set; }
        public decimal VacationPay { get; set; }
        public decimal MaternityPay { get; set; }
        public decimal BonusPay { get; set; }
        public decimal JubileeBonusPay { get; set; }
        public bool IsJubileeThisMonth { get; set; }
        public int JubileeAge { get; set; }
        public decimal TotalPayout
        {
            get { return BasePay + SickPay + VacationPay + MaternityPay + BonusPay + JubileeBonusPay; }
        }
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
                    int diff2 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    int mod2 = ((diff2 % 4) + 4) % 4;
                    return (mod2 == 0 || mod2 == 1) ? ShiftStatus.Work : ShiftStatus.Off;

                case ScheduleType.OneThree:
                    // Цикл 4 дня: 1 раб (сутки), 3 вых
                    int diff1 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    int mod1 = ((diff1 % 4) + 4) % 4;
                    return mod1 == 0 ? ShiftStatus.Work : ShiftStatus.Off;

                case ScheduleType.ThreeThree:
                    // Цикл 6 дней: 3 раб, 3 вых
                    int diff3 = (int)(date.Date - emp.AnchorDate.Date).TotalDays;
                    int mod3 = ((diff3 % 6) + 6) % 6;
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
            List<DayShiftInfo> result = new List<DayShiftInfo>();
            int days = DateTime.DaysInMonth(year, month);

            for (int day = 1; day <= days; day++)
            {
                DateTime date = new DateTime(year, month, day);
                ShiftStatus baseStatus = GetBaseStatus(emp, date);
                string key = emp.Id + "_" + date.ToString("yyyy-MM-dd");

                ShiftOverride ov;
                if (overrides != null && overrides.TryGetValue(key, out ov))
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
            int maternityDays = shifts.Count(s => s.EffectiveStatus == ShiftStatus.Maternity);
            int totalHours = shifts.Sum(s => s.Hours);

            decimal basePay = actual * emp.DailyRate;
            decimal sickPay = sickDays * emp.DailyRate * (emp.SickLeaveCompensationPercent / 100m);
            decimal vacationPay = vacationDays * emp.DailyRate * (emp.VacationCompensationPercent / 100m);
            decimal maternityPay = (maternityDays * emp.DailyRate * (emp.MaternityPayPercent / 100m)) +
                                  (maternityDays > 0 ? emp.MaternityMonthlyAllowance : 0m);

            bool isJubilee = false;
            int jubileeAge = 0;
            decimal jubileeBonus = 0m;

            if (emp.BirthDate.HasValue && shifts.Count > 0)
            {
                int curYear = shifts[0].Date.Year;
                int curMonth = shifts[0].Date.Month;
                int age = curYear - emp.BirthDate.Value.Year;

                if (emp.BirthDate.Value.Month == curMonth && age >= 50 && (age % 5 == 0))
                {
                    isJubilee = true;
                    jubileeAge = age;
                    jubileeBonus = emp.JubileeBonus > 0 ? emp.JubileeBonus : 10000m;
                }
            }

            return new PayrollResult
            {
                Employee = emp,
                PlannedShifts = planned,
                ActualWorkedShifts = actual,
                UnplannedWorkedShifts = unplanned,
                SickDays = sickDays,
                VacationDays = vacationDays,
                MaternityDays = maternityDays,
                TotalHours = totalHours,
                BasePay = basePay,
                SickPay = sickPay,
                VacationPay = vacationPay,
                MaternityPay = maternityPay,
                BonusPay = emp.MonthlyBonus,
                IsJubileeThisMonth = isJubilee,
                JubileeAge = jubileeAge,
                JubileeBonusPay = jubileeBonus
            };
        }

        public static string GetJubileeGreeting(string name, int age, string position, string department)
        {
            return "Глубокоуважаемый(ая) " + name + "!\n\n" +
                   "От всего коллектива и руководства предприятия сердечно поздравляем Вас со знаменательным юбилеем — " + age + " лет!\n\n" +
                   "Ваш добросовестный труд на позиции «" + position + "», верность профессии и высокий профессионализм вносят неоценимый вклад в развитие отдела «" + department + "». " +
                   "Вы заслужили искреннее признание и уважение коллег.\n\n" +
                   "Желаем Вам крепкого здоровья, неиссякаемой жизненной энергии, семейного счастья, оптимизма и благополучия на долгие годы!";
        }

        public static List<JubileeInfo> GetJubileesInMonth(List<Employee> employees, int year, int month)
        {
            List<JubileeInfo> result = new List<JubileeInfo>();
            if (employees == null) return result;

            foreach (Employee emp in employees)
            {
                if (!emp.BirthDate.HasValue) continue;
                if (emp.BirthDate.Value.Month != month) continue;

                int age = year - emp.BirthDate.Value.Year;
                if (age >= 50 && (age % 5 == 0))
                {
                    result.Add(new JubileeInfo
                    {
                        EmployeeId = emp.Id,
                        EmployeeName = emp.Name,
                        Position = emp.Position,
                        Department = emp.Department,
                        Phone = emp.Phone ?? "",
                        BirthDate = emp.BirthDate.Value,
                        Age = age,
                        Bonus = emp.JubileeBonus > 0 ? emp.JubileeBonus : 10000m,
                        CongratulationText = GetJubileeGreeting(emp.Name, age, emp.Position, emp.Department)
                    });
                }
            }

            return result;
        }
    }
}
