/**
 * Helper providing ready-to-run C# (.NET 8 / 9 WPF & WinForms) source code
 * that the user can copy or download to use in Microsoft Visual Studio.
 */

export const CSHARP_MODELS_CODE = `// ============================================================
// Models.cs - Модели данных графиков смен и расчёта зарплаты
// Для Microsoft Visual Studio (C# .NET 8 / .NET 9)
// ============================================================
using System;
using System.Collections.Generic;

namespace ShiftScheduleApp.Models
{
    public enum ScheduleType
    {
        TwoTwo,      // 2 через 2
        FiveTwo,     // 5 через 2
        ThreeThree,  // 3 через 3
        OneThree,    // 1 через 3 (сутки через трое)
        FourTwo,     // 4 через 2
        SixOne       // 6 через 1
    }

    public enum ShiftStatus
    {
        Work,           // Р  - Плановая рабочая смена
        Off,            // В  - Плановый выходной
        UnplannedOff,   // ВВ - Внеплановый выходной (отгул)
        UnplannedWork,  // ВР - Внеплановая смена (выход в выходной)
        Vacation,       // ОТ - Оплачиваемый отпуск
        SickLeave,      // Б  - Больничный лист
        Maternity,      // Д  - Декретный отпуск (по беременности и родам / уходу)
        Absence         // ПР - Прогул / без оплаты
    }

    public class Employee
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string FullName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Дата рождения сотрудника для вычисления юбилеев (50, 55, 60, 65+ лет)
        public DateTime? BirthDate { get; set; }

        // Дневная ставка за 1 рабочий день (руб.)
        public decimal DailyRate { get; set; } = 3500m;

        // Длительность смены в часах (например, 8, 10, 12, 24)
        public int ShiftHours { get; set; } = 12;

        // Тип графика (2/2, 5/2, 3/3, 1/3)
        public ScheduleType Schedule { get; set; } = ScheduleType.TwoTwo;

        // Дата первой рабочей смены (точка отсчёта цикла)
        public DateTime CycleStartDate { get; set; } = DateTime.Today;

        // Процент оплаты больничного (например, 80%)
        public decimal SickPayPercentage { get; set; } = 80m;

        // Процент оплаты отпуска (обычно 100%)
        public decimal VacationPayPercentage { get; set; } = 100m;

        // Процент оплаты декретного отпуска (100%)
        public decimal MaternityPayPercentage { get; set; } = 100m;

        // Фиксированное ежемесячное пособие по уходу за ребенком
        public decimal MaternityMonthlyAllowance { get; set; } = 0m;

        // Месячная премия
        public decimal MonthlyBonus { get; set; } = 0m;

        // Премия к юбилею (начиная с 50 лет)
        public decimal JubileeBonus { get; set; } = 0m;
    }

    public class ShiftOverride
    {
        public string EmployeeId { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public ShiftStatus Status { get; set; }
        public int? CustomHours { get; set; }
        public string Note { get; set; } = string.Empty;
    }

    public class DayShiftInfo
    {
        public DateTime Date { get; set; }
        public int DayNumber => Date.Day;
        public DayOfWeek DayOfWeek => Date.DayOfWeek;
        public bool IsCalendarWeekend => DayOfWeek == DayOfWeek.Saturday || DayOfWeek == DayOfWeek.Sunday;
        public ShiftStatus BaseStatus { get; set; }
        public ShiftStatus EffectiveStatus { get; set; }
        public int EffectiveHours { get; set; }
        public bool IsOverridden { get; set; }
        public string Note { get; set; } = string.Empty;
    }

    public class MonthlyPayrollResult
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Month { get; set; }

        public int PlannedWorkDays { get; set; }
        public int ActualWorkedDays { get; set; }
        public int UnplannedWorkDays { get; set; }
        public int UnplannedOffDays { get; set; }
        public int VacationDays { get; set; }
        public int SickDays { get; set; }
        public int MaternityDays { get; set; }
        public int TotalWorkedHours { get; set; }

        public decimal DailyRate { get; set; }
        public decimal BasePay { get; set; }
        public decimal SickPay { get; set; }
        public decimal VacationPay { get; set; }
        public decimal MaternityPay { get; set; }
        public decimal MonthlyBonus { get; set; }
        public decimal JubileeBonus { get; set; }
        public bool IsJubileeThisMonth { get; set; }
        public int JubileeAge { get; set; }
        public decimal TotalPayout => BasePay + SickPay + VacationPay + MaternityPay + MonthlyBonus + JubileeBonus;
    }
}
`;

export const CSHARP_CALCULATOR_CODE = `// ============================================================
// ScheduleCalculator.cs - Движок расчёта смен и зарплаты
// ============================================================
using System;
using System.Collections.Generic;
using System.Linq;
using ShiftScheduleApp.Models;

namespace ShiftScheduleApp.Services
{
    public class ScheduleCalculator
    {
        /// <summary>
        /// Определение базового статуса дня по графику работника
        /// </summary>
        public static ShiftStatus GetBaseStatus(Employee emp, DateTime date)
        {
            if (emp.Schedule == ScheduleType.FiveTwo)
            {
                return (date.DayOfWeek >= DayOfWeek.Monday && date.DayOfWeek <= DayOfWeek.Friday)
                    ? ShiftStatus.Work
                    : ShiftStatus.Off;
            }

            if (emp.Schedule == ScheduleType.SixOne)
            {
                return (date.DayOfWeek >= DayOfWeek.Monday && date.DayOfWeek <= DayOfWeek.Saturday)
                    ? ShiftStatus.Work
                    : ShiftStatus.Off;
            }

            int workDays = 2;
            int offDays = 2;

            switch (emp.Schedule)
            {
                case ScheduleType.TwoTwo:
                    workDays = 2; offDays = 2; break;
                case ScheduleType.ThreeThree:
                    workDays = 3; offDays = 3; break;
                case ScheduleType.OneThree:
                    workDays = 1; offDays = 3; break;
                case ScheduleType.FourTwo:
                    workDays = 4; offDays = 2; break;
            }

            int period = workDays + offDays;
            int diff = (int)(date.Date - emp.CycleStartDate.Date).TotalDays;
            int offset = ((diff % period) + period) % period;

            return offset < workDays ? ShiftStatus.Work : ShiftStatus.Off;
        }

        /// <summary>
        /// Построение табеля смен за месяц с учётом всех исключений
        /// </summary>
        public static List<DayShiftInfo> BuildMonthShifts(
            Employee emp, 
            int year, 
            int month, 
            List<ShiftOverride> overrides)
        {
            int daysCount = DateTime.DaysInMonth(year, month);
            var list = new List<DayShiftInfo>();

            for (int day = 1; day <= daysCount; day++)
            {
                var curDate = new DateTime(year, month, day);
                var baseStat = GetBaseStatus(emp, curDate);

                var ov = overrides.FirstOrDefault(o => o.EmployeeId == emp.Id && o.Date.Date == curDate.Date);

                var info = new DayShiftInfo
                {
                    Date = curDate,
                    BaseStatus = baseStat,
                    EffectiveStatus = ov?.Status ?? baseStat,
                    IsOverridden = ov != null,
                    Note = ov?.Note ?? string.Empty
                };

                if (info.EffectiveStatus == ShiftStatus.Work || info.EffectiveStatus == ShiftStatus.UnplannedWork)
                {
                    info.EffectiveHours = ov?.CustomHours ?? emp.ShiftHours;
                }
                else
                {
                    info.EffectiveHours = 0;
                }

                list.Add(info);
            }

            return list;
        }

        /// <summary>
        /// Расчёт зарплаты за месяц
        /// </summary>
        public static MonthlyPayrollResult CalculatePayroll(
            Employee emp, 
            int year, 
            int month, 
            List<DayShiftInfo> shifts)
        {
            var result = new MonthlyPayrollResult
            {
                EmployeeId = emp.Id,
                EmployeeName = emp.FullName,
                Year = year,
                Month = month,
                DailyRate = emp.DailyRate,
                MonthlyBonus = emp.MonthlyBonus
            };

            foreach (var s in shifts)
            {
                if (s.BaseStatus == ShiftStatus.Work)
                    result.PlannedWorkDays++;

                switch (s.EffectiveStatus)
                {
                    case ShiftStatus.Work:
                        result.ActualWorkedDays++;
                        result.TotalWorkedHours += s.EffectiveHours;
                        break;
                    case ShiftStatus.UnplannedWork:
                        result.ActualWorkedDays++;
                        result.UnplannedWorkDays++;
                        result.TotalWorkedHours += s.EffectiveHours;
                        break;
                    case ShiftStatus.UnplannedOff:
                        result.UnplannedOffDays++;
                        break;
                    case ShiftStatus.Vacation:
                        result.VacationDays++;
                        break;
                    case ShiftStatus.SickLeave:
                        result.SickDays++;
                        break;
                    case ShiftStatus.Maternity:
                        result.MaternityDays++;
                        break;
                }
            }

            // Оплата отработанных смен
            result.BasePay = result.ActualWorkedDays * emp.DailyRate;

            // Оплата больничного (% от ставки)
            result.SickPay = Math.Round(result.SickDays * emp.DailyRate * (emp.SickPayPercentage / 100m), 2);

            // Оплата отпускных
            result.VacationPay = Math.Round(result.VacationDays * emp.DailyRate * (emp.VacationPayPercentage / 100m), 2);

            // Оплата декретного отпуска (100% от ставки + ежемесячное пособие)
            result.MaternityPay = Math.Round(result.MaternityDays * emp.DailyRate * (emp.MaternityPayPercentage / 100m), 2) + emp.MaternityMonthlyAllowance;

            // Проверка на юбилей (50, 55, 60, 65+ лет)
            if (emp.BirthDate.HasValue && emp.BirthDate.Value.Month == month)
            {
                int age = year - emp.BirthDate.Value.Year;
                if (age >= 50 && age % 5 == 0)
                {
                    result.IsJubileeThisMonth = true;
                    result.JubileeAge = age;
                    result.JubileeBonus = emp.JubileeBonus;
                }
            }

            return result;
        }
    }
}
`;

export const CSHARP_WPF_XAML = `<!-- ============================================================ -->
<!-- MainWindow.xaml - Современный WPF интерфейс для Visual Studio -->
<!-- ============================================================ -->
<Window x:Class="ShiftScheduleApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="График смен и расчёт зарплаты" Height="720" Width="1100"
        WindowStartupLocation="CenterScreen" Background="#0F172A">
    
    <Grid Margin="16">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <!-- Заголовок и панель месяца -->
        <Border Grid.Row="0" Background="#1E293B" CornerRadius="12" Padding="16" Margin="0,0,0,12">
            <DockPanel LastChildFill="False">
                <StackPanel Orientation="Vertical">
                    <TextBlock Text="Управление Графиками и Зарплатой" FontSize="20" FontWeight="Bold" Foreground="White"/>
                    <TextBlock Text="Настоящий оконный интерфейс WPF в Visual Studio" FontSize="12" Foreground="#94A3B8"/>
                </StackPanel>

                <StackPanel Orientation="Horizontal" DockPanel.Dock="Right" VerticalAlignment="Center">
                    <Button x:Name="BtnPrevMonth" Content="◀" Width="36" Height="36" Margin="0,0,8,0" Click="BtnPrevMonth_Click"/>
                    <TextBlock x:Name="TxtCurrentMonth" Text="Ноябрь 2026" FontSize="16" FontWeight="SemiBold" Foreground="White" VerticalAlignment="Center" Margin="8,0"/>
                    <Button x:Name="BtnNextMonth" Content="▶" Width="36" Height="36" Margin="8,0,16,0" Click="BtnNextMonth_Click"/>
                    
                    <Button x:Name="BtnAddEmployee" Content="+ Добавить работника" Background="#2563EB" Foreground="White" Padding="12,6" Click="BtnAddEmployee_Click"/>
                </StackPanel>
            </DockPanel>
        </Border>

        <!-- Быстрая статистика -->
        <UniformGrid Grid.Row="1" Columns="4" Margin="0,0,0,12">
            <Border Background="#1E293B" CornerRadius="8" Padding="12" Margin="0,0,8,0">
                <StackPanel>
                    <TextBlock Text="Всего работников" Foreground="#94A3B8" FontSize="11"/>
                    <TextBlock x:Name="TxtEmpCount" Text="6 чел." Foreground="White" FontSize="20" FontWeight="Bold"/>
                </StackPanel>
            </Border>
            <Border Background="#1E293B" CornerRadius="8" Padding="12" Margin="0,0,8,0">
                <StackPanel>
                    <TextBlock Text="Отработано смен" Foreground="#94A3B8" FontSize="11"/>
                    <TextBlock x:Name="TxtTotalShifts" Text="84 смен" Foreground="#38BDF8" FontSize="20" FontWeight="Bold"/>
                </StackPanel>
            </Border>
            <Border Background="#1E293B" CornerRadius="8" Padding="12" Margin="0,0,8,0">
                <StackPanel>
                    <TextBlock Text="Больничные / Отпуска" Foreground="#94A3B8" FontSize="11"/>
                    <TextBlock x:Name="TxtLeaves" Text="4 б. / 7 отп." Foreground="#FB7185" FontSize="20" FontWeight="Bold"/>
                </StackPanel>
            </Border>
            <Border Background="#1E293B" CornerRadius="8" Padding="12">
                <StackPanel>
                    <TextBlock Text="Общий фонд зарплаты" Foreground="#94A3B8" FontSize="11"/>
                    <TextBlock x:Name="TxtTotalSalary" Text="412 800 ₽" Foreground="#4ADE80" FontSize="20" FontWeight="Bold"/>
                </StackPanel>
            </Border>
        </UniformGrid>

        <!-- Таблица сотрудников и расчёта зарплаты -->
        <Border Grid.Row="2" Background="#1E293B" CornerRadius="12" Padding="12">
            <DataGrid x:Name="GridPayroll" AutoGenerateColumns="False" IsReadOnly="True" 
                      Background="Transparent" RowBackground="#0F172A" AlternatingRowBackground="#1E293B"
                      Foreground="White" BorderThickness="0" SelectionMode="Single">
                <DataGrid.Columns>
                    <DataGridTextColumn Header="Сотрудник" Binding="{Binding EmployeeName}" Width="2*"/>
                    <DataGridTextColumn Header="Ставка/день" Binding="{Binding DailyRate, StringFormat={}{0:N0} ₽}" Width="*"/>
                    <DataGridTextColumn Header="План смен" Binding="{Binding PlannedWorkDays}" Width="80"/>
                    <DataGridTextColumn Header="Факт смен" Binding="{Binding ActualWorkedDays}" Width="80"/>
                    <DataGridTextColumn Header="Больничные" Binding="{Binding SickDays}" Width="90"/>
                    <DataGridTextColumn Header="Отпуск" Binding="{Binding VacationDays}" Width="80"/>
                    <DataGridTextColumn Header="Больничные (руб)" Binding="{Binding SickPay, StringFormat={}{0:N0} ₽}" Width="*"/>
                    <DataGridTextColumn Header="Итого к выплате" Binding="{Binding TotalPayout, StringFormat={}{0:N0} ₽}" Width="1.3*"/>
                </DataGrid.Columns>
            </DataGrid>
        </Border>

        <!-- Нижняя панель действий -->
        <StackPanel Grid.Row="3" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,12,0,0">
            <Button x:Name="BtnChangeRate" Content="Изменить ставку работника" Background="#334155" Foreground="White" Padding="12,8" Margin="0,0,8,0" Click="BtnChangeRate_Click"/>
            <Button x:Name="BtnAssignLeave" Content="Назначить отпуск / больничный" Background="#334155" Foreground="White" Padding="12,8" Margin="0,0,8,0" Click="BtnAssignLeave_Click"/>
            <Button x:Name="BtnExport" Content="Экспорт отчёта" Background="#059669" Foreground="White" Padding="16,8" Click="BtnExport_Click"/>
        </StackPanel>
    </Grid>
</Window>
`;
