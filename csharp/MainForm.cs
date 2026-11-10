using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace ShiftScheduleApp
{
    public class MainForm : Form
    {
        private int _year = 2026;
        private int _month = 11;
        private string _selectedDepartment = "ВСЕ";

        private List<Employee> _employees;
        private Dictionary<string, ShiftOverride> _overrides;

        // UI Controls
        private Label _lblMonth;
        private ComboBox _cmbDept;
        private Label _lblKpiEmployees;
        private Label _lblKpiShifts;
        private Label _lblKpiSick;
        private Label _lblKpiVacation;
        private Label _lblKpiMaternity;
        private Label _lblKpiPayroll;
        private Button _btnJubileesHeader;

        private TabControl _tabControl;
        private TabPage _tabMatrix;
        private TabPage _tabPayroll;
        private TabPage _tabEmployees;

        private DataGridView _gridMatrix;
        private DataGridView _gridPayroll;
        private DataGridView _gridEmployees;

        private static readonly string[] RussianMonths = new string[]
        {
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        };

        public MainForm()
        {
            InitializeData();
            InitializeComponent();
            RefreshAllViews();
        }

        private void InitializeData()
        {
            _employees = new List<Employee>
            {
                new Employee
                {
                    Id = "emp-1",
                    Name = "Иванов Алексей Петрович",
                    Position = "Старший сменный мастер",
                    Department = "Производство",
                    Phone = "+7 (921) 450-12-34",
                    DailyRate = 4500,
                    Schedule = ScheduleType.TwoTwo,
                    ShiftHours = 12,
                    AnchorDate = new DateTime(2026, 11, 1),
                    BirthDate = new DateTime(1976, 11, 15), // 50 лет в ноябре 2026! Юбилей!
                    MonthlyBonus = 5000,
                    JubileeBonus = 15000
                },
                new Employee
                {
                    Id = "emp-2",
                    Name = "Смирнова Екатерина Михайловна",
                    Position = "Оператор производственной линии",
                    Department = "Производство",
                    Phone = "+7 (911) 345-67-89",
                    DailyRate = 3600,
                    Schedule = ScheduleType.TwoTwo,
                    ShiftHours = 12,
                    AnchorDate = new DateTime(2026, 11, 3),
                    BirthDate = new DateTime(1992, 4, 18)
                },
                new Employee
                {
                    Id = "emp-3",
                    Name = "Кузнецов Дмитрий Сергеевич",
                    Position = "Дежурный инженер КИПиА",
                    Department = "Служба эксплуатации",
                    Phone = "+7 (905) 789-01-23",
                    DailyRate = 5200,
                    Schedule = ScheduleType.OneThree,
                    ShiftHours = 24,
                    AnchorDate = new DateTime(2026, 11, 1),
                    BirthDate = new DateTime(1988, 8, 22)
                },
                new Employee
                {
                    Id = "emp-4",
                    Name = "Морозова Анна Владимировна",
                    Position = "Бухгалтер-экономист",
                    Department = "Финансовый отдел",
                    Phone = "+7 (916) 234-56-78",
                    DailyRate = 4200,
                    Schedule = ScheduleType.FiveTwo,
                    ShiftHours = 8,
                    BirthDate = new DateTime(1995, 3, 12)
                },
                new Employee
                {
                    Id = "emp-5",
                    Name = "Васильев Роман Андреевич",
                    Position = "Кладовщик-комплектовщик",
                    Department = "Логистика",
                    Phone = "+7 (926) 890-12-34",
                    DailyRate = 3400,
                    Schedule = ScheduleType.ThreeThree,
                    ShiftHours = 10,
                    AnchorDate = new DateTime(2026, 11, 1),
                    BirthDate = new DateTime(1966, 11, 28), // 60 лет в ноябре 2026! Юбилей!
                    JubileeBonus = 20000
                },
                new Employee
                {
                    Id = "emp-6",
                    Name = "Попова Ольга Николаевна",
                    Position = "Менеджер по отгрузкам",
                    Department = "Логистика",
                    Phone = "+7 (903) 567-89-01",
                    DailyRate = 3800,
                    Schedule = ScheduleType.FiveTwo,
                    ShiftHours = 8,
                    BirthDate = new DateTime(1985, 9, 5),
                    MonthlyBonus = 7000
                },
                new Employee
                {
                    Id = "emp-7",
                    Name = "Соколова Марина Александровна",
                    Position = "Специалист по кадрам",
                    Department = "Финансовый отдел",
                    Phone = "+7 (912) 678-90-12",
                    DailyRate = 3900,
                    Schedule = ScheduleType.FiveTwo,
                    ShiftHours = 8,
                    BirthDate = new DateTime(1993, 6, 10),
                    MaternityPayPercent = 100,
                    MaternityMonthlyAllowance = 15000
                }
            };

            _overrides = new Dictionary<string, ShiftOverride>
            {
                ["emp-1_2026-11-07"] = new ShiftOverride { Status = ShiftStatus.UnplannedWork, Hours = 12, Note = "Замена по производственной необходимости" },
                ["emp-2_2026-11-12"] = new ShiftOverride { Status = ShiftStatus.UnplannedOff, Hours = 0, Note = "Отгул по семейным обстоятельствам" },
                ["emp-4_2026-11-10"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Больничный лист" },
                ["emp-4_2026-11-11"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Больничный лист" },
                ["emp-4_2026-11-12"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Больничный лист" },
                ["emp-4_2026-11-13"] = new ShiftOverride { Status = ShiftStatus.Sick, Hours = 0, Note = "Больничный лист" },
                ["emp-5_2026-11-16"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-17"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-18"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-19"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-20"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-21"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" },
                ["emp-5_2026-11-22"] = new ShiftOverride { Status = ShiftStatus.Vacation, Hours = 0, Note = "Очередной отпуск" }
            };

            // Декретный отпуск Соколовой М.А. на весь ноябрь 2026
            for (int d = 1; d <= 30; d++)
            {
                string key = "emp-7_2026-11-" + d.ToString("D2");
                _overrides[key] = new ShiftOverride
                {
                    Status = ShiftStatus.Maternity,
                    Hours = 0,
                    Note = "Декретный отпуск (по беременности и родам)"
                };
            }
        }

        private void InitializeComponent()
        {
            this.Text = "График Смен и Автоматический Расчёт Зарплаты (C# 7.3 / .NET Windows)";
            this.Size = new Size(1280, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            this.BackColor = Color.FromArgb(248, 250, 252);

            // Top Header Panel
            Panel pnlHeader = new Panel
            {
                Dock = DockStyle.Top,
                Height = 130,
                BackColor = Color.White,
                Padding = new Padding(16, 12, 16, 10)
            };

            Label lblTitle = new Label
            {
                Text = "График Смен и Расчёт Зарплаты",
                Font = new Font("Segoe UI", 14f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                AutoSize = true,
                Location = new Point(16, 12)
            };

            Label lblSubtitle = new Label
            {
                Text = "Сменные графики (2/2, 5/2, 1/3, 3/3), внеплановые смены, больничные и расчёт выплат (БЕЗ Node.js)",
                Font = new Font("Segoe UI", 8.5f),
                ForeColor = Color.FromArgb(100, 116, 139),
                AutoSize = true,
                Location = new Point(18, 40)
            };

            // Month Navigator Buttons
            Button btnPrevMonth = new Button
            {
                Text = "◀",
                Size = new Size(36, 28),
                Location = new Point(560, 12),
                BackColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat
            };
            btnPrevMonth.FlatAppearance.BorderSize = 1;
            btnPrevMonth.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnPrevMonth.Click += (s, e) => {
                _month--;
                if (_month < 1) { _month = 12; _year--; }
                RefreshAllViews();
            };

            _lblMonth = new Label
            {
                Text = "Ноябрь 2026",
                Font = new Font("Segoe UI", 11f, FontStyle.Bold),
                TextAlign = ContentAlignment.MiddleCenter,
                Size = new Size(150, 28),
                Location = new Point(600, 12)
            };

            Button btnNextMonth = new Button
            {
                Text = "▶",
                Size = new Size(36, 28),
                Location = new Point(754, 12),
                BackColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat
            };
            btnNextMonth.FlatAppearance.BorderSize = 1;
            btnNextMonth.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnNextMonth.Click += (s, e) => {
                _month++;
                if (_month > 12) { _month = 1; _year++; }
                RefreshAllViews();
            };

            // Department filter
            Label lblDept = new Label { Text = "Отдел:", Location = new Point(810, 16), AutoSize = true };
            _cmbDept = new ComboBox
            {
                DropDownStyle = ComboBoxStyle.DropDownList,
                Location = new Point(865, 13),
                Size = new Size(180, 26)
            };
            _cmbDept.Items.Add("ВСЕ");
            _cmbDept.Items.Add("Производство");
            _cmbDept.Items.Add("Служба эксплуатации");
            _cmbDept.Items.Add("Финансовый отдел");
            _cmbDept.Items.Add("Логистика");
            _cmbDept.SelectedIndex = 0;
            _cmbDept.SelectedIndexChanged += (s, e) => {
                _selectedDepartment = _cmbDept.SelectedItem.ToString();
                RefreshAllViews();
            };

            // Action Buttons
            _btnJubileesHeader = new Button
            {
                Text = "🎂 Юбиляры месяца (50+)",
                Location = new Point(1060, 11),
                Size = new Size(180, 30),
                BackColor = Color.FromArgb(254, 243, 199),
                ForeColor = Color.FromArgb(146, 64, 14),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold)
            };
            _btnJubileesHeader.FlatAppearance.BorderColor = Color.FromArgb(252, 211, 77);
            _btnJubileesHeader.Click += BtnJubilees_Click;

            Button btnAddEmp = new Button
            {
                Text = "+ Сотрудник",
                Location = new Point(1125, 11),
                Size = new Size(110, 30),
                BackColor = Color.FromArgb(37, 99, 235),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            btnAddEmp.FlatAppearance.BorderSize = 0;
            btnAddEmp.Click += BtnAddEmployee_Click;

            Button btnDeleteEmp = new Button
            {
                Text = "Удалить",
                Location = new Point(1245, 11),
                Size = new Size(100, 30),
                BackColor = Color.FromArgb(254, 242, 242),
                ForeColor = Color.FromArgb(220, 38, 38),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            btnDeleteEmp.FlatAppearance.BorderColor = Color.FromArgb(254, 202, 202);
            btnDeleteEmp.Click += BtnDeleteEmployee_Click;

            // KPI Strip
            Panel pnlKpi = new Panel
            {
                Location = new Point(16, 70),
                Size = new Size(1350, 48),
                BackColor = Color.FromArgb(248, 250, 252)
            };

            _lblKpiEmployees = CreateKpiLabel("Сотрудников:", "7 чел.", 10, pnlKpi);
            _lblKpiShifts = CreateKpiLabel("Отработано смен:", "88 / 95", 190, pnlKpi);
            _lblKpiSick = CreateKpiLabel("Больничные:", "4 дн.", 420, pnlKpi);
            _lblKpiVacation = CreateKpiLabel("Отпуска:", "7 дн.", 600, pnlKpi);
            _lblKpiMaternity = CreateKpiLabel("Декретные:", "30 дн.", 780, pnlKpi);
            _lblKpiMaternity.ForeColor = Color.FromArgb(107, 33, 168);
            _lblKpiPayroll = CreateKpiLabel("Фонд зарплаты (ФОТ):", "0 ₽", 970, pnlKpi);
            _lblKpiPayroll.ForeColor = Color.FromArgb(22, 101, 52);

            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSubtitle);
            pnlHeader.Controls.Add(btnPrevMonth);
            pnlHeader.Controls.Add(_lblMonth);
            pnlHeader.Controls.Add(btnNextMonth);
            pnlHeader.Controls.Add(lblDept);
            pnlHeader.Controls.Add(_cmbDept);
            pnlHeader.Controls.Add(_btnJubileesHeader);
            pnlHeader.Controls.Add(btnAddEmp);
            pnlHeader.Controls.Add(btnDeleteEmp);
            pnlHeader.Controls.Add(pnlKpi);

            this.Controls.Add(pnlHeader);

            // Tab Control
            _tabControl = new TabControl
            {
                Dock = DockStyle.Fill,
                Padding = new Point(16, 8)
            };

            _tabMatrix = new TabPage("  Табель смен (Матрица месяца)  ");
            _tabPayroll = new TabPage("  Расчётная ведомость заработной платы  ");
            _tabEmployees = new TabPage("  Список сотрудников и ставки  ");

            SetupMatrixTab();
            SetupPayrollTab();
            SetupEmployeesTab();

            _tabControl.TabPages.Add(_tabMatrix);
            _tabControl.TabPages.Add(_tabPayroll);
            _tabControl.TabPages.Add(_tabEmployees);

            this.Controls.Add(_tabControl);
            _tabControl.BringToFront();

            // Bottom Status / Tools bar
            Panel pnlBottom = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 44,
                BackColor = Color.White,
                Padding = new Padding(16, 8, 16, 8)
            };

            Button btnExportCsv = new Button
            {
                Text = "Экспорт в Excel (CSV)",
                Size = new Size(160, 28),
                Location = new Point(16, 8),
                BackColor = Color.FromArgb(240, 253, 244),
                ForeColor = Color.FromArgb(22, 101, 52),
                FlatStyle = FlatStyle.Flat
            };
            btnExportCsv.FlatAppearance.BorderColor = Color.FromArgb(187, 247, 208);
            btnExportCsv.Click += BtnExportCsv_Click;

            Button btnPeriod = new Button
            {
                Text = "Назначить период (отпуск/больничный/декрет)",
                Size = new Size(310, 28),
                Location = new Point(185, 8),
                BackColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat
            };
            btnPeriod.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnPeriod.Click += BtnPeriod_Click;

            Button btnJubileeBottom = new Button
            {
                Text = "🎂 Поздравление юбиляров (от 50 лет)",
                Size = new Size(270, 28),
                Location = new Point(505, 8),
                BackColor = Color.FromArgb(254, 243, 199),
                ForeColor = Color.FromArgb(146, 64, 14),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold)
            };
            btnJubileeBottom.FlatAppearance.BorderColor = Color.FromArgb(252, 211, 77);
            btnJubileeBottom.Click += BtnJubilees_Click;

            Label lblHint = new Label
            {
                Text = "💡 Кликните дважды по ячейке дня для смены статуса",
                ForeColor = Color.FromArgb(100, 116, 139),
                AutoSize = true,
                Location = new Point(785, 14)
            };

            pnlBottom.Controls.Add(btnExportCsv);
            pnlBottom.Controls.Add(btnPeriod);
            pnlBottom.Controls.Add(btnJubileeBottom);
            pnlBottom.Controls.Add(lblHint);
            this.Controls.Add(pnlBottom);
        }

        private Label CreateKpiLabel(string title, string value, int x, Panel parent)
        {
            Label lbl = new Label
            {
                Text = title + " " + value,
                Location = new Point(x, 14),
                AutoSize = true,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(30, 41, 59)
            };
            parent.Controls.Add(lbl);
            return lbl;
        }

        private void SetupMatrixTab()
        {
            _gridMatrix = new DataGridView
            {
                Dock = DockStyle.Fill,
                BackgroundColor = Color.White,
                BorderStyle = BorderStyle.None,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                ReadOnly = true,
                RowHeadersVisible = false,
                SelectionMode = DataGridViewSelectionMode.CellSelect,
                MultiSelect = false,
                ColumnHeadersHeight = 36,
                RowTemplate = { Height = 32 }
            };
            _gridMatrix.CellDoubleClick += GridMatrix_CellDoubleClick;
            _tabMatrix.Controls.Add(_gridMatrix);
        }

        private void SetupPayrollTab()
        {
            _gridPayroll = new DataGridView
            {
                Dock = DockStyle.Fill,
                BackgroundColor = Color.White,
                BorderStyle = BorderStyle.None,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                ReadOnly = true,
                RowHeadersVisible = false,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                ColumnHeadersHeight = 36,
                RowTemplate = { Height = 34 }
            };

            Panel pnlPayrollTop = new Panel
            {
                Dock = DockStyle.Top,
                Height = 44,
                BackColor = Color.FromArgb(248, 250, 252),
                Padding = new Padding(12, 6, 12, 6)
            };

            Button btnEditRate = new Button
            {
                Text = "Изменить дневную ставку выбранного сотрудника",
                Size = new Size(320, 30),
                Location = new Point(12, 7),
                BackColor = Color.FromArgb(37, 99, 235),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            btnEditRate.FlatAppearance.BorderSize = 0;
            btnEditRate.Click += BtnEditRate_Click;

            Button btnPrintSlip = new Button
            {
                Text = "Показать расчётный листок",
                Size = new Size(220, 30),
                Location = new Point(345, 7),
                BackColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            btnPrintSlip.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnPrintSlip.Click += BtnPrintSlip_Click;

            pnlPayrollTop.Controls.Add(btnEditRate);
            pnlPayrollTop.Controls.Add(btnPrintSlip);

            _tabPayroll.Controls.Add(_gridPayroll);
            _tabPayroll.Controls.Add(pnlPayrollTop);
        }

        private void SetupEmployeesTab()
        {
            Panel pnlEmpTop = new Panel
            {
                Dock = DockStyle.Top,
                Height = 44,
                BackColor = Color.FromArgb(248, 250, 252),
                Padding = new Padding(10, 6, 10, 6)
            };

            Button btnAdd = new Button
            {
                Text = "+ Добавить сотрудника",
                Location = new Point(10, 7),
                Size = new Size(170, 30),
                BackColor = Color.FromArgb(37, 99, 235),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            btnAdd.FlatAppearance.BorderSize = 0;
            btnAdd.Click += BtnAddEmployee_Click;

            Button btnDelete = new Button
            {
                Text = "🗑 Удалить сотрудника",
                Location = new Point(190, 7),
                Size = new Size(170, 30),
                BackColor = Color.FromArgb(254, 242, 242),
                ForeColor = Color.FromArgb(220, 38, 38),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            btnDelete.FlatAppearance.BorderColor = Color.FromArgb(254, 202, 202);
            btnDelete.Click += BtnDeleteEmployee_Click;

            pnlEmpTop.Controls.Add(btnAdd);
            pnlEmpTop.Controls.Add(btnDelete);

            _gridEmployees = new DataGridView
            {
                Dock = DockStyle.Fill,
                BackgroundColor = Color.White,
                BorderStyle = BorderStyle.None,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                ReadOnly = true,
                RowHeadersVisible = false,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                ColumnHeadersHeight = 36,
                RowTemplate = { Height = 34 }
            };

            _tabEmployees.Controls.Add(_gridEmployees);
            _tabEmployees.Controls.Add(pnlEmpTop);
        }

        private void RefreshAllViews()
        {
            _lblMonth.Text = RussianMonths[_month - 1] + " " + _year;

            List<Employee> filtered = _employees.Where(e =>
                _selectedDepartment == "ВСЕ" || e.Department == _selectedDepartment
            ).ToList();

            // Refresh KPI
            int totalEmployees = filtered.Count;
            int totalPlanned = 0;
            int totalActual = 0;
            int totalSick = 0;
            int totalVacation = 0;
            int totalMaternity = 0;
            decimal totalFund = 0;

            foreach (Employee emp in filtered)
            {
                List<DayShiftInfo> shifts = ScheduleEngine.CalculateMonthShifts(emp, _year, _month, _overrides);
                PayrollResult pay = ScheduleEngine.CalculatePayroll(emp, shifts);
                totalPlanned += pay.PlannedShifts;
                totalActual += pay.ActualWorkedShifts;
                totalSick += pay.SickDays;
                totalVacation += pay.VacationDays;
                totalMaternity += pay.MaternityDays;
                totalFund += pay.TotalPayout;
            }

            List<JubileeInfo> monthJubilees = ScheduleEngine.GetJubileesInMonth(_employees, _year, _month);
            _btnJubileesHeader.Text = monthJubilees.Count > 0
                ? "🎂 Юбиляры (" + monthJubilees.Count + " чел.)"
                : "🎂 Юбиляры (0)";
            _btnJubileesHeader.BackColor = monthJubilees.Count > 0 ? Color.FromArgb(254, 243, 199) : Color.FromArgb(241, 245, 249);
            _btnJubileesHeader.ForeColor = monthJubilees.Count > 0 ? Color.FromArgb(146, 64, 14) : Color.FromArgb(100, 116, 139);

            _lblKpiEmployees.Text = "Сотрудников: " + totalEmployees + " чел.";
            _lblKpiShifts.Text = "Смены факт/план: " + totalActual + " / " + totalPlanned;
            _lblKpiSick.Text = "Больничные: " + totalSick + " дн.";
            _lblKpiVacation.Text = "Отпуска: " + totalVacation + " дн.";
            _lblKpiMaternity.Text = "Декретные: " + totalMaternity + " дн.";
            _lblKpiPayroll.Text = "Фонд з/п (ФОТ): " + totalFund.ToString("N0") + " ₽";

            RefreshMatrixGrid(filtered);
            RefreshPayrollGrid(filtered);
            RefreshEmployeesGrid(filtered);
        }

        private void RefreshMatrixGrid(List<Employee> filtered)
        {
            _gridMatrix.Columns.Clear();
            _gridMatrix.Rows.Clear();

            _gridMatrix.Columns.Add("Name", "Сотрудник / График");
            _gridMatrix.Columns["Name"].Width = 250;
            _gridMatrix.Columns["Name"].Frozen = true;

            int daysInMonth = DateTime.DaysInMonth(_year, _month);
            for (int d = 1; d <= daysInMonth; d++)
            {
                DateTime dt = new DateTime(_year, _month, d);
                string colName = "day_" + d;
                string dayOfWeek = dt.ToString("ddd", new System.Globalization.CultureInfo("ru-RU"));
                int colIdx = _gridMatrix.Columns.Add(colName, d.ToString() + "\n" + dayOfWeek);
                _gridMatrix.Columns[colIdx].Width = 36;
                _gridMatrix.Columns[colIdx].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;

                if (dt.DayOfWeek == DayOfWeek.Saturday || dt.DayOfWeek == DayOfWeek.Sunday)
                {
                    _gridMatrix.Columns[colIdx].HeaderCell.Style.BackColor = Color.FromArgb(254, 242, 242);
                    _gridMatrix.Columns[colIdx].HeaderCell.Style.ForeColor = Color.FromArgb(185, 28, 28);
                }
            }

            _gridMatrix.Columns.Add("Summary", "Смены");
            _gridMatrix.Columns["Summary"].Width = 80;
            _gridMatrix.Columns["Summary"].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;

            _gridMatrix.Columns.Add("Payout", "К выплате");
            _gridMatrix.Columns["Payout"].Width = 110;
            _gridMatrix.Columns["Payout"].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;

            foreach (Employee emp in filtered)
            {
                List<DayShiftInfo> shifts = ScheduleEngine.CalculateMonthShifts(emp, _year, _month, _overrides);
                PayrollResult pay = ScheduleEngine.CalculatePayroll(emp, shifts);

                object[] rowValues = new object[daysInMonth + 3];
                string nameDisplay = emp.Name;
                if (pay.IsJubileeThisMonth)
                {
                    nameDisplay = "🎂 " + emp.Name + " (" + pay.JubileeAge + "л)";
                }
                rowValues[0] = nameDisplay + " [" + emp.Schedule + "]";

                for (int d = 1; d <= daysInMonth; d++)
                {
                    DayShiftInfo shift = shifts[d - 1];
                    string code = "";
                    switch (shift.EffectiveStatus)
                    {
                        case ShiftStatus.Work: code = "Р"; break;
                        case ShiftStatus.Off: code = "В"; break;
                        case ShiftStatus.UnplannedWork: code = "ВР"; break;
                        case ShiftStatus.UnplannedOff: code = "ВВ"; break;
                        case ShiftStatus.Sick: code = "Б"; break;
                        case ShiftStatus.Vacation: code = "ОТ"; break;
                        case ShiftStatus.Maternity: code = "Д"; break;
                        default: code = "-"; break;
                    }
                    rowValues[d] = code;
                }

                rowValues[daysInMonth + 1] = pay.ActualWorkedShifts + "/" + pay.PlannedShifts;
                rowValues[daysInMonth + 2] = pay.TotalPayout.ToString("N0") + " ₽";

                int rowIdx = _gridMatrix.Rows.Add(rowValues);
                _gridMatrix.Rows[rowIdx].Tag = emp;

                // Color cells
                for (int d = 1; d <= daysInMonth; d++)
                {
                    DayShiftInfo shift = shifts[d - 1];
                    DataGridViewCell cell = _gridMatrix.Rows[rowIdx].Cells[d];
                    switch (shift.EffectiveStatus)
                    {
                        case ShiftStatus.Work:
                            cell.Style.BackColor = Color.FromArgb(220, 252, 231); // green
                            cell.Style.ForeColor = Color.FromArgb(22, 101, 52);
                            break;
                        case ShiftStatus.Off:
                            cell.Style.BackColor = Color.FromArgb(248, 250, 252); // light slate
                            cell.Style.ForeColor = Color.FromArgb(148, 163, 184);
                            break;
                        case ShiftStatus.UnplannedWork:
                            cell.Style.BackColor = Color.FromArgb(224, 231, 255); // indigo
                            cell.Style.ForeColor = Color.FromArgb(67, 56, 202);
                            cell.Style.Font = new Font(_gridMatrix.Font, FontStyle.Bold);
                            break;
                        case ShiftStatus.UnplannedOff:
                            cell.Style.BackColor = Color.FromArgb(254, 243, 199); // amber
                            cell.Style.ForeColor = Color.FromArgb(180, 83, 9);
                            break;
                        case ShiftStatus.Sick:
                            cell.Style.BackColor = Color.FromArgb(254, 226, 226); // red
                            cell.Style.ForeColor = Color.FromArgb(185, 28, 28);
                            cell.Style.Font = new Font(_gridMatrix.Font, FontStyle.Bold);
                            break;
                        case ShiftStatus.Vacation:
                            cell.Style.BackColor = Color.FromArgb(204, 251, 241); // teal
                            cell.Style.ForeColor = Color.FromArgb(15, 118, 110);
                            cell.Style.Font = new Font(_gridMatrix.Font, FontStyle.Bold);
                            break;
                        case ShiftStatus.Maternity:
                            cell.Style.BackColor = Color.FromArgb(243, 232, 255); // purple
                            cell.Style.ForeColor = Color.FromArgb(107, 33, 168);
                            cell.Style.Font = new Font(_gridMatrix.Font, FontStyle.Bold);
                            break;
                    }

                    if (shift.IsOverride)
                    {
                        cell.ToolTipText = "Ручное переопределение: " + shift.Note;
                    }
                }
            }
        }

        private void RefreshPayrollGrid(List<Employee> filtered)
        {
            _gridPayroll.Columns.Clear();
            _gridPayroll.Rows.Clear();

            _gridPayroll.Columns.Add("Name", "ФИО сотрудника");
            _gridPayroll.Columns["Name"].Width = 230;
            _gridPayroll.Columns.Add("Dept", "Отдел");
            _gridPayroll.Columns["Dept"].Width = 130;
            _gridPayroll.Columns.Add("Rate", "Ставка/день");
            _gridPayroll.Columns["Rate"].Width = 100;
            _gridPayroll.Columns.Add("Shifts", "Смены");
            _gridPayroll.Columns["Shifts"].Width = 100;
            _gridPayroll.Columns.Add("Hours", "Часы");
            _gridPayroll.Columns["Hours"].Width = 70;
            _gridPayroll.Columns.Add("BasePay", "Оклад");
            _gridPayroll.Columns["BasePay"].Width = 100;
            _gridPayroll.Columns.Add("SickPay", "Больничные");
            _gridPayroll.Columns["SickPay"].Width = 100;
            _gridPayroll.Columns.Add("VacPay", "Отпускные");
            _gridPayroll.Columns["VacPay"].Width = 100;
            _gridPayroll.Columns.Add("MatPay", "Декретные");
            _gridPayroll.Columns["MatPay"].Width = 100;
            _gridPayroll.Columns.Add("Bonus", "Премия");
            _gridPayroll.Columns["Bonus"].Width = 85;
            _gridPayroll.Columns.Add("Jubilee", "Юбилей (50+)");
            _gridPayroll.Columns["Jubilee"].Width = 110;
            _gridPayroll.Columns.Add("Total", "ИТОГО К ВЫПЛАТЕ");
            _gridPayroll.Columns["Total"].Width = 130;

            foreach (Employee emp in filtered)
            {
                List<DayShiftInfo> shifts = ScheduleEngine.CalculateMonthShifts(emp, _year, _month, _overrides);
                PayrollResult pay = ScheduleEngine.CalculatePayroll(emp, shifts);

                string jubileeText = pay.JubileeBonusPay > 0
                    ? ("🎂 " + pay.JubileeBonusPay.ToString("N0") + " ₽")
                    : (pay.IsJubileeThisMonth ? "🎂 Юбиляр!" : "—");

                int rowIdx = _gridPayroll.Rows.Add(
                    emp.Name,
                    emp.Department,
                    emp.DailyRate.ToString("N0") + " ₽",
                    pay.ActualWorkedShifts + " / " + pay.PlannedShifts,
                    pay.TotalHours + " ч",
                    pay.BasePay.ToString("N0") + " ₽",
                    pay.SickPay.ToString("N0") + " ₽",
                    pay.VacationPay.ToString("N0") + " ₽",
                    pay.MaternityPay.ToString("N0") + " ₽",
                    pay.BonusPay.ToString("N0") + " ₽",
                    jubileeText,
                    pay.TotalPayout.ToString("N0") + " ₽"
                );

                _gridPayroll.Rows[rowIdx].Tag = emp;
                _gridPayroll.Rows[rowIdx].Cells["Total"].Style.Font = new Font(_gridPayroll.Font, FontStyle.Bold);
                _gridPayroll.Rows[rowIdx].Cells["Total"].Style.ForeColor = Color.FromArgb(22, 101, 52);

                if (pay.MaternityDays > 0)
                {
                    _gridPayroll.Rows[rowIdx].Cells["MatPay"].Style.ForeColor = Color.FromArgb(107, 33, 168);
                    _gridPayroll.Rows[rowIdx].Cells["MatPay"].Style.Font = new Font(_gridPayroll.Font, FontStyle.Bold);
                }

                if (pay.IsJubileeThisMonth)
                {
                    _gridPayroll.Rows[rowIdx].Cells["Jubilee"].Style.BackColor = Color.FromArgb(254, 243, 199);
                    _gridPayroll.Rows[rowIdx].Cells["Jubilee"].Style.ForeColor = Color.FromArgb(146, 64, 14);
                    _gridPayroll.Rows[rowIdx].Cells["Jubilee"].Style.Font = new Font(_gridPayroll.Font, FontStyle.Bold);
                }
            }
        }

        private void RefreshEmployeesGrid(List<Employee> filtered)
        {
            _gridEmployees.Columns.Clear();
            _gridEmployees.Rows.Clear();

            _gridEmployees.Columns.Add("Name", "ФИО");
            _gridEmployees.Columns["Name"].Width = 220;
            _gridEmployees.Columns.Add("Phone", "Телефон");
            _gridEmployees.Columns["Phone"].Width = 140;
            _gridEmployees.Columns.Add("BirthDate", "Дата рождения");
            _gridEmployees.Columns["BirthDate"].Width = 120;
            _gridEmployees.Columns.Add("Age", "Возраст / Юбилей");
            _gridEmployees.Columns["Age"].Width = 140;
            _gridEmployees.Columns.Add("Position", "Должность");
            _gridEmployees.Columns["Position"].Width = 180;
            _gridEmployees.Columns.Add("Dept", "Отдел");
            _gridEmployees.Columns["Dept"].Width = 140;
            _gridEmployees.Columns.Add("Schedule", "График");
            _gridEmployees.Columns["Schedule"].Width = 110;
            _gridEmployees.Columns.Add("Rate", "Дневная ставка");
            _gridEmployees.Columns["Rate"].Width = 120;
            _gridEmployees.Columns.Add("Hours", "Часов в смене");
            _gridEmployees.Columns["Hours"].Width = 110;

            foreach (Employee emp in filtered)
            {
                string birthStr = emp.BirthDate.HasValue ? emp.BirthDate.Value.ToString("dd.MM.yyyy") : "—";
                string ageStr = "—";
                bool isJubilee = false;

                if (emp.BirthDate.HasValue)
                {
                    int age = _year - emp.BirthDate.Value.Year;
                    if (new DateTime(_year, _month, 1) < emp.BirthDate.Value.AddYears(age)) age--;
                    isJubilee = (age >= 50 && age % 5 == 0);
                    ageStr = age + " лет" + (isJubilee ? " 🎂 Юбилей!" : "");
                }

                int r = _gridEmployees.Rows.Add(
                    emp.Name,
                    emp.Phone ?? "",
                    birthStr,
                    ageStr,
                    emp.Position,
                    emp.Department,
                    emp.Schedule.ToString(),
                    emp.DailyRate.ToString("N0") + " ₽",
                    emp.ShiftHours + " ч"
                );
                _gridEmployees.Rows[r].Tag = emp;

                if (isJubilee)
                {
                    _gridEmployees.Rows[r].Cells["Age"].Style.BackColor = Color.FromArgb(254, 243, 199);
                    _gridEmployees.Rows[r].Cells["Age"].Style.ForeColor = Color.FromArgb(146, 64, 14);
                    _gridEmployees.Rows[r].Cells["Age"].Style.Font = new Font(_gridEmployees.Font, FontStyle.Bold);
                }
            }
        }

        private void GridMatrix_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0 || e.ColumnIndex < 1 || e.ColumnIndex > DateTime.DaysInMonth(_year, _month))
                return;

            Employee emp = _gridMatrix.Rows[e.RowIndex].Tag as Employee;
            if (emp == null) return;

            int day = e.ColumnIndex;
            DateTime date = new DateTime(_year, _month, day);
            string key = emp.Id + "_" + date.ToString("yyyy-MM-dd");

            using (Form dlg = new Form())
            {
                dlg.Text = "Назначение смены: " + emp.Name + " (" + date.ToString("dd.MM.yyyy") + ")";
                dlg.Size = new Size(420, 280);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;
                dlg.MinimizeBox = false;

                Label lblPrompt = new Label { Text = "Выберите статус для дня " + date.ToString("dd.MM.yyyy") + ":", Location = new Point(20, 20), AutoSize = true };
                ComboBox cmb = new ComboBox { Location = new Point(20, 50), Size = new Size(360, 26), DropDownStyle = ComboBoxStyle.DropDownList };
                cmb.Items.Add("Рабочая смена (Р) - по графику");
                cmb.Items.Add("Плановый выходной (В)");
                cmb.Items.Add("Внеплановая рабочая смена (ВР) - переработка");
                cmb.Items.Add("Внеплановый выходной (ВВ) - отгул");
                cmb.Items.Add("Оплачиваемый отпуск (ОТ)");
                cmb.Items.Add("Больничный лист (Б)");
                cmb.Items.Add("Декретный отпуск (Д) - БиР / уход за ребенком");
                cmb.SelectedIndex = 0;

                Label lblNote = new Label { Text = "Причина / примечание:", Location = new Point(20, 90), AutoSize = true };
                TextBox txtNote = new TextBox { Location = new Point(20, 115), Size = new Size(360, 24) };

                Button btnOk = new Button { Text = "Сохранить", DialogResult = DialogResult.OK, Location = new Point(190, 180), Size = new Size(90, 30) };
                Button btnCancel = new Button { Text = "Отмена", DialogResult = DialogResult.Cancel, Location = new Point(290, 180), Size = new Size(90, 30) };

                dlg.Controls.Add(lblPrompt);
                dlg.Controls.Add(cmb);
                dlg.Controls.Add(lblNote);
                dlg.Controls.Add(txtNote);
                dlg.Controls.Add(btnOk);
                dlg.Controls.Add(btnCancel);
                dlg.AcceptButton = btnOk;

                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    ShiftStatus newStatus;
                    switch (cmb.SelectedIndex)
                    {
                        case 0: newStatus = ShiftStatus.Work; break;
                        case 1: newStatus = ShiftStatus.Off; break;
                        case 2: newStatus = ShiftStatus.UnplannedWork; break;
                        case 3: newStatus = ShiftStatus.UnplannedOff; break;
                        case 4: newStatus = ShiftStatus.Vacation; break;
                        case 5: newStatus = ShiftStatus.Sick; break;
                        case 6: newStatus = ShiftStatus.Maternity; break;
                        default: newStatus = ShiftStatus.Work; break;
                    }

                    _overrides[key] = new ShiftOverride
                    {
                        Status = newStatus,
                        Hours = (newStatus == ShiftStatus.Work || newStatus == ShiftStatus.UnplannedWork) ? emp.ShiftHours : 0,
                        Note = txtNote.Text
                    };

                    RefreshAllViews();
                }
            }
        }

        private void BtnEditRate_Click(object sender, EventArgs e)
        {
            if (_gridPayroll.CurrentRow == null) return;
            Employee emp = _gridPayroll.CurrentRow.Tag as Employee;
            if (emp == null) return;

            using (Form dlg = new Form())
            {
                dlg.Text = "Изменение ставки: " + emp.Name;
                dlg.Size = new Size(380, 180);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;

                Label lbl = new Label { Text = "Дневная ставка за 1 рабочий день (руб.):", Location = new Point(20, 20), AutoSize = true };
                TextBox txt = new TextBox { Text = emp.DailyRate.ToString("0"), Location = new Point(20, 48), Size = new Size(320, 24) };

                Button btnOk = new Button { Text = "Сохранить", DialogResult = DialogResult.OK, Location = new Point(150, 95), Size = new Size(90, 30) };
                Button btnCancel = new Button { Text = "Отмена", DialogResult = DialogResult.Cancel, Location = new Point(250, 95), Size = new Size(90, 30) };

                dlg.Controls.Add(lbl);
                dlg.Controls.Add(txt);
                dlg.Controls.Add(btnOk);
                dlg.Controls.Add(btnCancel);

                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    decimal rate;
                    if (decimal.TryParse(txt.Text, out rate) && rate > 0)
                    {
                        emp.DailyRate = rate;
                        RefreshAllViews();
                    }
                }
            }
        }

        private void BtnPrintSlip_Click(object sender, EventArgs e)
        {
            if (_gridPayroll.CurrentRow == null) return;
            Employee emp = _gridPayroll.CurrentRow.Tag as Employee;
            if (emp == null) return;

            List<DayShiftInfo> shifts = ScheduleEngine.CalculateMonthShifts(emp, _year, _month, _overrides);
            PayrollResult pay = ScheduleEngine.CalculatePayroll(emp, shifts);

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("==================================================");
            sb.AppendLine("         РАСЧЁТНЫЙ ЛИСТОК ЗА " + RussianMonths[_month - 1].ToUpper() + " " + _year);
            sb.AppendLine("==================================================");
            sb.AppendLine("Сотрудник: " + emp.Name);
            if (!string.IsNullOrEmpty(emp.Phone))
            {
                sb.AppendLine("Телефон:   " + emp.Phone);
            }
            if (emp.BirthDate.HasValue)
            {
                sb.AppendLine("Дата рождения: " + emp.BirthDate.Value.ToString("dd.MM.yyyy") + (pay.IsJubileeThisMonth ? " (🎂 ЮБИЛЕЙ: " + pay.JubileeAge + " ЛЕТ!)" : ""));
            }
            sb.AppendLine("Должность: " + emp.Position);
            sb.AppendLine("Отдел:     " + emp.Department);
            sb.AppendLine("График:    " + emp.Schedule + " (ставка: " + emp.DailyRate.ToString("N0") + " ₽/день)");
            sb.AppendLine("--------------------------------------------------");
            sb.AppendLine("Отработано смен: " + pay.ActualWorkedShifts + " из " + pay.PlannedShifts + " плановых (" + pay.TotalHours + " часов)");
            sb.AppendLine("Дней на больничном: " + pay.SickDays + " дн.");
            sb.AppendLine("Дней в отпуске:     " + pay.VacationDays + " дн.");
            if (pay.MaternityDays > 0)
            {
                sb.AppendLine("Дней в декрете:     " + pay.MaternityDays + " дн.");
            }
            sb.AppendLine("--------------------------------------------------");
            sb.AppendLine("Оклад за смены:     " + pay.BasePay.ToString("N0") + " ₽");
            sb.AppendLine("Больничное пособие: " + pay.SickPay.ToString("N0") + " ₽");
            sb.AppendLine("Отпускные выплаты:  " + pay.VacationPay.ToString("N0") + " ₽");
            if (pay.MaternityPay > 0)
            {
                sb.AppendLine("Декретные выплаты:  " + pay.MaternityPay.ToString("N0") + " ₽ (БиР / пособие)");
            }
            sb.AppendLine("Премия / надбавка:  " + pay.BonusPay.ToString("N0") + " ₽");
            if (pay.JubileeBonusPay > 0)
            {
                sb.AppendLine("🎂 Юбилейная премия: " + pay.JubileeBonusPay.ToString("N0") + " ₽ (к " + pay.JubileeAge + "-летию)");
            }
            sb.AppendLine("==================================================");
            sb.AppendLine("ИТОГО К ВЫПЛАТЕ:    " + pay.TotalPayout.ToString("N0") + " ₽");
            sb.AppendLine("==================================================");

            MessageBox.Show(sb.ToString(), "Расчётный листок - " + emp.Name, MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void BtnJubilees_Click(object sender, EventArgs e)
        {
            List<JubileeInfo> jubilees = ScheduleEngine.GetJubileesInMonth(_employees, _year, _month);

            using (Form dlg = new Form())
            {
                dlg.Text = "🎂 Поздравление юбиляров за " + RussianMonths[_month - 1] + " " + _year + " (начиная с 50 лет)";
                dlg.Size = new Size(680, 560);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;

                if (jubilees.Count == 0)
                {
                    Label lblEmpty = new Label
                    {
                        Text = "В этом месяце (" + RussianMonths[_month - 1] + " " + _year + ") нет юбиляров от 50 лет.\n(Юбилеями считаются круглые даты 50, 55, 60, 65, 70 и более лет).",
                        Font = new Font("Segoe UI", 11f),
                        ForeColor = Color.FromArgb(100, 116, 139),
                        TextAlign = ContentAlignment.MiddleCenter,
                        Dock = DockStyle.Fill
                    };
                    dlg.Controls.Add(lblEmpty);
                    dlg.ShowDialog();
                    return;
                }

                int currentIdx = 0;

                Panel pnlTopNav = new Panel { Dock = DockStyle.Top, Height = 45, BackColor = Color.FromArgb(254, 243, 199) };
                Label lblNav = new Label
                {
                    Text = "Юбиляр 1 из " + jubilees.Count,
                    Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(146, 64, 14),
                    Location = new Point(20, 12),
                    AutoSize = true
                };

                Button btnPrev = new Button { Text = "◀ Предыдущий", Location = new Point(360, 8), Size = new Size(130, 28) };
                Button btnNext = new Button { Text = "Следующий ▶", Location = new Point(500, 8), Size = new Size(130, 28) };
                btnPrev.Enabled = false;
                btnNext.Enabled = jubilees.Count > 1;

                pnlTopNav.Controls.Add(lblNav);
                pnlTopNav.Controls.Add(btnPrev);
                pnlTopNav.Controls.Add(btnNext);
                dlg.Controls.Add(pnlTopNav);

                // Body elements
                Label lblEmpName = new Label { Font = new Font("Segoe UI", 13f, FontStyle.Bold), Location = new Point(25, 65), AutoSize = true, ForeColor = Color.FromArgb(15, 23, 42) };
                Label lblDetails = new Label { Font = new Font("Segoe UI", 9.5f), Location = new Point(25, 95), AutoSize = true, ForeColor = Color.FromArgb(100, 116, 139) };

                Label lblLetterTitle = new Label { Text = "Поздравительный адрес от коллектива и руководства:", Font = new Font("Segoe UI", 9.5f, FontStyle.Bold), Location = new Point(25, 128), AutoSize = true };
                TextBox txtGreeting = new TextBox
                {
                    Location = new Point(25, 150),
                    Size = new Size(615, 220),
                    Multiline = true,
                    ReadOnly = true,
                    ScrollBars = ScrollBars.Vertical,
                    Font = new Font("Segoe UI", 9.5f),
                    BackColor = Color.FromArgb(255, 251, 235),
                    ForeColor = Color.FromArgb(120, 53, 15)
                };

                Label lblBonus = new Label { Text = "Юбилейная выплата / премия (₽):", Location = new Point(25, 385), AutoSize = true, Font = new Font("Segoe UI", 9f, FontStyle.Bold) };
                TextBox txtBonus = new TextBox { Location = new Point(25, 410), Size = new Size(180, 26) };

                Button btnSaveBonus = new Button
                {
                    Text = "Сохранить премию",
                    Location = new Point(215, 408),
                    Size = new Size(140, 30),
                    BackColor = Color.FromArgb(37, 99, 235),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat
                };
                btnSaveBonus.FlatAppearance.BorderSize = 0;

                Button btnCopy = new Button
                {
                    Text = "📋 Скопировать поздравление",
                    Location = new Point(370, 408),
                    Size = new Size(270, 30),
                    BackColor = Color.FromArgb(241, 245, 249),
                    FlatStyle = FlatStyle.Flat
                };
                btnCopy.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);

                Action updateView = () =>
                {
                    JubileeInfo j = jubilees[currentIdx];
                    lblNav.Text = "Юбиляр " + (currentIdx + 1) + " из " + jubilees.Count;
                    lblEmpName.Text = "🎂 " + j.EmployeeName + " — " + j.Age + " лет!";
                    lblDetails.Text = "Дата рождения: " + j.BirthDate.ToString("dd.MM.yyyy") + "  |  Должность: " + j.Position + " (" + j.Department + ")";
                    txtGreeting.Text = j.CongratulationText;
                    txtBonus.Text = j.Bonus.ToString("0");
                    btnPrev.Enabled = currentIdx > 0;
                    btnNext.Enabled = currentIdx < jubilees.Count - 1;
                };

                btnPrev.Click += (s, ev) => { if (currentIdx > 0) { currentIdx--; updateView(); } };
                btnNext.Click += (s, ev) => { if (currentIdx < jubilees.Count - 1) { currentIdx++; updateView(); } };

                btnSaveBonus.Click += (s, ev) =>
                {
                    decimal b;
                    if (decimal.TryParse(txtBonus.Text, out b) && b >= 0)
                    {
                        JubileeInfo j = jubilees[currentIdx];
                        Employee emp = _employees.FirstOrDefault(e => e.Id == j.EmployeeId);
                        if (emp != null)
                        {
                            emp.JubileeBonus = b;
                            j.Bonus = b;
                            RefreshAllViews();
                            MessageBox.Show("Юбилейная премия для " + emp.Name + " установлена в размере " + b.ToString("N0") + " ₽!", "Сохранено", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                    }
                };

                btnCopy.Click += (s, ev) =>
                {
                    Clipboard.SetText(txtGreeting.Text);
                    MessageBox.Show("Текст поздравления скопирован в буфер обмена!", "Готово", MessageBoxButtons.OK, MessageBoxIcon.Information);
                };

                Button btnClose = new Button { Text = "Закрыть", DialogResult = DialogResult.OK, Location = new Point(530, 470), Size = new Size(110, 32) };

                dlg.Controls.Add(lblEmpName);
                dlg.Controls.Add(lblDetails);
                dlg.Controls.Add(lblLetterTitle);
                dlg.Controls.Add(txtGreeting);
                dlg.Controls.Add(lblBonus);
                dlg.Controls.Add(txtBonus);
                dlg.Controls.Add(btnSaveBonus);
                dlg.Controls.Add(btnCopy);
                dlg.Controls.Add(btnClose);

                updateView();
                dlg.ShowDialog();
            }
        }

        private void BtnAddEmployee_Click(object sender, EventArgs e)
        {
            using (Form dlg = new Form())
            {
                dlg.Text = "Добавить нового сотрудника";
                dlg.Size = new Size(420, 480);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;

                Label lblName = new Label { Text = "ФИО:", Location = new Point(20, 15), AutoSize = true };
                TextBox txtName = new TextBox { Location = new Point(20, 35), Size = new Size(360, 24) };

                Label lblBirth = new Label { Text = "Дата рождения (ДД.ММ.ГГГГ):", Location = new Point(20, 65), AutoSize = true };
                DateTimePicker dtpBirth = new DateTimePicker { Location = new Point(20, 85), Size = new Size(360, 24), Format = DateTimePickerFormat.Short, Value = new DateTime(1985, 1, 1) };

                Label lblPhone = new Label { Text = "Номер телефона (+7 ...):", Location = new Point(20, 115), AutoSize = true };
                TextBox txtPhone = new TextBox { Location = new Point(20, 135), Size = new Size(360, 24), Text = "+7 " };

                Label lblPos = new Label { Text = "Должность:", Location = new Point(20, 165), AutoSize = true };
                TextBox txtPos = new TextBox { Location = new Point(20, 185), Size = new Size(360, 24) };

                Label lblDept = new Label { Text = "Отдел:", Location = new Point(20, 215), AutoSize = true };
                ComboBox cmbDept = new ComboBox { Location = new Point(20, 235), Size = new Size(360, 24), DropDownStyle = ComboBoxStyle.DropDownList };
                cmbDept.Items.Add("Производство");
                cmbDept.Items.Add("Служба эксплуатации");
                cmbDept.Items.Add("Финансовый отдел");
                cmbDept.Items.Add("Логистика");
                cmbDept.SelectedIndex = 0;

                Label lblRate = new Label { Text = "Дневная ставка (руб./день):", Location = new Point(20, 270), AutoSize = true };
                TextBox txtRate = new TextBox { Text = "3500", Location = new Point(20, 290), Size = new Size(170, 24) };

                Label lblSched = new Label { Text = "График:", Location = new Point(200, 270), AutoSize = true };
                ComboBox cmbSched = new ComboBox { Location = new Point(200, 290), Size = new Size(180, 24), DropDownStyle = ComboBoxStyle.DropDownList };
                cmbSched.Items.Add("TwoTwo (2/2)");
                cmbSched.Items.Add("FiveTwo (5/2)");
                cmbSched.Items.Add("OneThree (1/3)");
                cmbSched.Items.Add("ThreeThree (3/3)");
                cmbSched.SelectedIndex = 0;

                Button btnOk = new Button { Text = "Добавить", DialogResult = DialogResult.OK, Location = new Point(190, 380), Size = new Size(90, 30) };
                Button btnCancel = new Button { Text = "Отмена", DialogResult = DialogResult.Cancel, Location = new Point(290, 380), Size = new Size(90, 30) };

                dlg.Controls.Add(lblName); dlg.Controls.Add(txtName);
                dlg.Controls.Add(lblBirth); dlg.Controls.Add(dtpBirth);
                dlg.Controls.Add(lblPhone); dlg.Controls.Add(txtPhone);
                dlg.Controls.Add(lblPos); dlg.Controls.Add(txtPos);
                dlg.Controls.Add(lblDept); dlg.Controls.Add(cmbDept);
                dlg.Controls.Add(lblRate); dlg.Controls.Add(txtRate);
                dlg.Controls.Add(lblSched); dlg.Controls.Add(cmbSched);
                dlg.Controls.Add(btnOk); dlg.Controls.Add(btnCancel);

                if (dlg.ShowDialog() == DialogResult.OK && !string.IsNullOrWhiteSpace(txtName.Text))
                {
                    decimal rate;
                    decimal.TryParse(txtRate.Text, out rate);

                    ScheduleType sched = ScheduleType.TwoTwo;
                    int hours = 12;
                    if (cmbSched.SelectedIndex == 1) { sched = ScheduleType.FiveTwo; hours = 8; }
                    else if (cmbSched.SelectedIndex == 2) { sched = ScheduleType.OneThree; hours = 24; }
                    else if (cmbSched.SelectedIndex == 3) { sched = ScheduleType.ThreeThree; hours = 10; }

                    _employees.Add(new Employee
                    {
                        Name = txtName.Text.Trim(),
                        Phone = txtPhone.Text.Trim(),
                        BirthDate = dtpBirth.Value.Date,
                        Position = txtPos.Text.Trim(),
                        Department = cmbDept.SelectedItem.ToString(),
                        DailyRate = rate > 0 ? rate : 3500,
                        Schedule = sched,
                        ShiftHours = hours,
                        AnchorDate = new DateTime(_year, _month, 1)
                    });

                    RefreshAllViews();
                }
            }
        }

        private void BtnDeleteEmployee_Click(object sender, EventArgs e)
        {
            if (_employees.Count == 0)
            {
                MessageBox.Show("Список сотрудников пуст.", "Удаление", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            // Propose selected employee if one is selected in _gridEmployees
            Employee preselected = null;
            if (_gridEmployees != null && _gridEmployees.SelectedRows.Count > 0 && _gridEmployees.SelectedRows[0].Index < _employees.Count)
            {
                preselected = _employees[_gridEmployees.SelectedRows[0].Index];
            }

            using (Form dlg = new Form())
            {
                dlg.Text = "Удалить сотрудника";
                dlg.Size = new Size(420, 220);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;
                dlg.MinimizeBox = false;

                Label lblPrompt = new Label
                {
                    Text = "Выберите сотрудника для удаления:",
                    Location = new Point(20, 15),
                    AutoSize = true,
                    Font = new Font("Segoe UI", 9f, FontStyle.Bold)
                };

                ComboBox cmbEmp = new ComboBox
                {
                    Location = new Point(20, 42),
                    Size = new Size(360, 26),
                    DropDownStyle = ComboBoxStyle.DropDownList,
                    Font = new Font("Segoe UI", 9.5f)
                };

                int defaultIndex = 0;
                for (int i = 0; i < _employees.Count; i++)
                {
                    Employee emp = _employees[i];
                    cmbEmp.Items.Add(emp.Name + " (" + emp.Position + ", " + emp.Department + ")");
                    if (preselected != null && emp.Id == preselected.Id)
                    {
                        defaultIndex = i;
                    }
                }
                cmbEmp.SelectedIndex = defaultIndex;

                Button btnDelete = new Button
                {
                    Text = "Удалить",
                    DialogResult = DialogResult.OK,
                    Location = new Point(175, 120),
                    Size = new Size(95, 32),
                    BackColor = Color.FromArgb(220, 38, 38),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat,
                    Font = new Font("Segoe UI", 9f, FontStyle.Bold)
                };
                btnDelete.FlatAppearance.BorderSize = 0;

                Button btnCancel = new Button
                {
                    Text = "Отмена",
                    DialogResult = DialogResult.Cancel,
                    Location = new Point(285, 120),
                    Size = new Size(95, 32)
                };

                dlg.Controls.Add(lblPrompt);
                dlg.Controls.Add(cmbEmp);
                dlg.Controls.Add(btnDelete);
                dlg.Controls.Add(btnCancel);

                if (dlg.ShowDialog() == DialogResult.OK && cmbEmp.SelectedIndex >= 0)
                {
                    Employee target = _employees[cmbEmp.SelectedIndex];
                    DialogResult confirm = MessageBox.Show(
                        "Вы действительно хотите удалить сотрудника \"" + target.Name + "\"?\nВсе связанные с ним смены и расчёты будут безвозвратно удалены.",
                        "Подтверждение удаления",
                        MessageBoxButtons.YesNo,
                        MessageBoxIcon.Warning
                    );

                    if (confirm == DialogResult.Yes)
                    {
                        // Remove overrides for this employee
                        List<string> keysToRemove = _overrides.Keys
                            .Where(k => k.StartsWith(target.Id + "_"))
                            .ToList();
                        foreach (string key in keysToRemove)
                        {
                            _overrides.Remove(key);
                        }

                        _employees.Remove(target);
                        RefreshAllViews();
                        MessageBox.Show("Сотрудник \"" + target.Name + "\" успешно удален.", "Готово", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                }
            }
        }

        private void BtnPeriod_Click(object sender, EventArgs e)
        {
            using (Form dlg = new Form())
            {
                dlg.Text = "Назначить период отпуска, больничного или декрета";
                dlg.Size = new Size(440, 330);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;

                Label lblEmp = new Label { Text = "Сотрудник:", Location = new Point(20, 15), AutoSize = true };
                ComboBox cmbEmp = new ComboBox { Location = new Point(20, 35), Size = new Size(380, 24), DropDownStyle = ComboBoxStyle.DropDownList };
                foreach (Employee emp in _employees) cmbEmp.Items.Add(emp.Name);
                if (cmbEmp.Items.Count > 0) cmbEmp.SelectedIndex = 0;

                Label lblType = new Label { Text = "Тип периода:", Location = new Point(20, 75), AutoSize = true };
                ComboBox cmbType = new ComboBox { Location = new Point(20, 95), Size = new Size(380, 24), DropDownStyle = ComboBoxStyle.DropDownList };
                cmbType.Items.Add("Оплачиваемый отпуск (ОТ)");
                cmbType.Items.Add("Больничный лист (Б)");
                cmbType.Items.Add("Декретный отпуск (Д) - БиР / уход за ребенком");
                cmbType.SelectedIndex = 0;

                Label lblFrom = new Label { Text = "С числа:", Location = new Point(20, 135), AutoSize = true };
                NumericUpDown numFrom = new NumericUpDown { Location = new Point(20, 155), Size = new Size(170, 24), Minimum = 1, Maximum = DateTime.DaysInMonth(_year, _month), Value = 1 };

                Label lblTo = new Label { Text = "По число:", Location = new Point(210, 135), AutoSize = true };
                NumericUpDown numTo = new NumericUpDown { Location = new Point(210, 155), Size = new Size(190, 24), Minimum = 1, Maximum = DateTime.DaysInMonth(_year, _month), Value = 7 };

                Button btnOk = new Button { Text = "Применить", DialogResult = DialogResult.OK, Location = new Point(200, 225), Size = new Size(95, 30) };
                Button btnCancel = new Button { Text = "Отмена", DialogResult = DialogResult.Cancel, Location = new Point(305, 225), Size = new Size(95, 30) };

                dlg.Controls.Add(lblEmp); dlg.Controls.Add(cmbEmp);
                dlg.Controls.Add(lblType); dlg.Controls.Add(cmbType);
                dlg.Controls.Add(lblFrom); dlg.Controls.Add(numFrom);
                dlg.Controls.Add(lblTo); dlg.Controls.Add(numTo);
                dlg.Controls.Add(btnOk); dlg.Controls.Add(btnCancel);

                if (dlg.ShowDialog() == DialogResult.OK && cmbEmp.SelectedIndex >= 0)
                {
                    Employee selectedEmp = _employees[cmbEmp.SelectedIndex];
                    ShiftStatus status;
                    string note;
                    if (cmbType.SelectedIndex == 0) { status = ShiftStatus.Vacation; note = "Очередной отпуск"; }
                    else if (cmbType.SelectedIndex == 1) { status = ShiftStatus.Sick; note = "Больничный лист"; }
                    else { status = ShiftStatus.Maternity; note = "Декретный отпуск"; }

                    int start = (int)numFrom.Value;
                    int end = (int)numTo.Value;
                    if (start > end) { int tmp = start; start = end; end = tmp; }

                    for (int d = start; d <= end; d++)
                    {
                        string key = selectedEmp.Id + "_" + _year.ToString("D4") + "-" + _month.ToString("D2") + "-" + d.ToString("D2");
                        _overrides[key] = new ShiftOverride
                        {
                            Status = status,
                            Hours = 0,
                            Note = note
                        };
                    }

                    RefreshAllViews();
                }
            }
        }

        private void BtnExportCsv_Click(object sender, EventArgs e)
        {
            using (SaveFileDialog sfd = new SaveFileDialog())
            {
                sfd.Filter = "CSV файлы (*.csv)|*.csv";
                sfd.FileName = "Ведомость_зарплаты_" + RussianMonths[_month - 1] + "_" + _year + ".csv";
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("ФИО сотрудника;Телефон;Дата рождения;Возраст;Должность;Отдел;Дневная ставка;Отработано смен;Плановых смен;Часов;Оклад;Больничные;Отпускные;Декретные;Премия;Юбилейная выплата;ИТОГО К ВЫПЛАТЕ");

                    foreach (Employee emp in _employees)
                    {
                        List<DayShiftInfo> shifts = ScheduleEngine.CalculateMonthShifts(emp, _year, _month, _overrides);
                        PayrollResult pay = ScheduleEngine.CalculatePayroll(emp, shifts);

                        string birthStr = emp.BirthDate.HasValue ? emp.BirthDate.Value.ToString("dd.MM.yyyy") : "";
                        string ageStr = emp.BirthDate.HasValue ? (_year - emp.BirthDate.Value.Year).ToString() : "";

                        sb.AppendLine(string.Format("{0};{1};{2};{3};{4};{5};{6};{7};{8};{9};{10};{11};{12};{13};{14};{15};{16}",
                            emp.Name,
                            emp.Phone ?? "",
                            birthStr,
                            ageStr,
                            emp.Position,
                            emp.Department,
                            emp.DailyRate,
                            pay.ActualWorkedShifts,
                            pay.PlannedShifts,
                            pay.TotalHours,
                            pay.BasePay,
                            pay.SickPay,
                            pay.VacationPay,
                            pay.MaternityPay,
                            pay.BonusPay,
                            pay.JubileeBonusPay,
                            pay.TotalPayout
                        ));
                    }

                    File.WriteAllText(sfd.FileName, sb.ToString(), Encoding.UTF8);
                    MessageBox.Show("Ведомость успешно экспортирована в файл:\n" + sfd.FileName, "Экспорт завершён", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }
    }
}
