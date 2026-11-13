using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Npgsql;

namespace ShiftScheduleApp
{
    public class DbConfig
    {
        public string Host { get; set; } = "localhost";
        public int Port { get; set; } = 5432;
        public string Database { get; set; } = "shift_schedule";
        public string Username { get; set; } = "postgres";
        public string Password { get; set; } = "";
        public bool Enabled { get; set; } = false;

        public string BuildConnectionString()
        {
            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = string.IsNullOrWhiteSpace(Host) ? "localhost" : Host.Trim(),
                Port = Port > 0 ? Port : 5432,
                Database = string.IsNullOrWhiteSpace(Database) ? "shift_schedule" : Database.Trim(),
                Username = string.IsNullOrWhiteSpace(Username) ? "postgres" : Username.Trim(),
                Password = Password ?? string.Empty,
                Timeout = 5,
                CommandTimeout = 10
            };
            return builder.ConnectionString;
        }
    }

    public class DatabaseService
    {
        private static readonly string ConfigFilePath = Path.Combine(AppContext.BaseDirectory, "db_config.json");

        public DbConfig Config { get; private set; }
        public bool IsConnected { get; private set; }
        public string LastError { get; private set; } = string.Empty;

        public DatabaseService()
        {
            Config = LoadConfig();
        }

        public static DbConfig LoadConfig()
        {
            try
            {
                if (File.Exists(ConfigFilePath))
                {
                    string json = File.ReadAllText(ConfigFilePath);
                    DbConfig loaded = JsonSerializer.Deserialize<DbConfig>(json);
                    if (loaded != null) return loaded;
                }
            }
            catch
            {
                // Ignore corrupt config and use defaults
            }
            return new DbConfig();
        }

        public void SaveConfig(DbConfig config)
        {
            Config = config ?? new DbConfig();
            try
            {
                string json = JsonSerializer.Serialize(Config, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(ConfigFilePath, json);
            }
            catch
            {
                // Ignore write errors if read-only folder
            }
        }

        public bool TestConnection(DbConfig testConfig, out string serverVersion, out string error)
        {
            serverVersion = string.Empty;
            error = string.Empty;
            try
            {
                using var conn = new NpgsqlConnection(testConfig.BuildConnectionString());
                conn.Open();
                using var cmd = new NpgsqlCommand("SELECT version();", conn);
                object res = cmd.ExecuteScalar();
                serverVersion = res?.ToString() ?? "PostgreSQL";
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                return false;
            }
        }

        public bool TryConnectAndEnsureSchema(
            List<Employee> fallbackEmployees,
            Dictionary<string, ShiftOverride> fallbackOverrides,
            bool seedIfEmpty = true)
        {
            if (!Config.Enabled)
            {
                IsConnected = false;
                LastError = string.Empty;
                return false;
            }

            try
            {
                using var conn = new NpgsqlConnection(Config.BuildConnectionString());
                conn.Open();

                EnsureTables(conn);

                if (seedIfEmpty && fallbackEmployees != null)
                {
                    using var countCmd = new NpgsqlCommand("SELECT COUNT(*) FROM employees;", conn);
                    long count = Convert.ToInt64(countCmd.ExecuteScalar() ?? 0);
                    if (count == 0)
                    {
                        foreach (var emp in fallbackEmployees)
                        {
                            UpsertEmployeeInternal(conn, emp);
                        }
                        if (fallbackOverrides != null)
                        {
                            foreach (var kv in fallbackOverrides)
                            {
                                var parts = kv.Key.Split('_');
                                if (parts.Length == 2 && DateTime.TryParse(parts[1], out DateTime dt))
                                {
                                    UpsertShiftOverrideInternal(conn, parts[0], dt, kv.Value);
                                }
                            }
                        }
                    }
                }

                IsConnected = true;
                LastError = string.Empty;
                return true;
            }
            catch (Exception ex)
            {
                IsConnected = false;
                LastError = ex.Message;
                return false;
            }
        }

        public void PushAllToDatabase(List<Employee> employees, Dictionary<string, ShiftOverride> overrides)
        {
            if (!Config.Enabled) return;

            using var conn = new NpgsqlConnection(Config.BuildConnectionString());
            conn.Open();
            EnsureTables(conn);

            foreach (var emp in employees)
            {
                UpsertEmployeeInternal(conn, emp);
            }

            foreach (var kv in overrides)
            {
                var parts = kv.Key.Split('_');
                if (parts.Length == 2 && DateTime.TryParse(parts[1], out DateTime dt))
                {
                    UpsertShiftOverrideInternal(conn, parts[0], dt, kv.Value);
                }
            }

            IsConnected = true;
            LastError = string.Empty;
        }

        private static void EnsureTables(NpgsqlConnection conn)
        {
            const string sql = @"
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL DEFAULT '',
    department VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(64) NOT NULL DEFAULT '',
    daily_rate NUMERIC(12, 2) NOT NULL DEFAULT 3500,
    schedule_type INTEGER NOT NULL DEFAULT 0,
    shift_hours INTEGER NOT NULL DEFAULT 12,
    anchor_date DATE NOT NULL DEFAULT '2026-11-01',
    birth_date DATE NULL,
    monthly_bonus NUMERIC(12, 2) NOT NULL DEFAULT 0,
    jubilee_bonus NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sick_leave_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
    vacation_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
    maternity_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
    maternity_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shift_overrides (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    status INTEGER NOT NULL,
    hours INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (employee_id, shift_date)
);";
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.ExecuteNonQuery();
        }

        public List<Employee> LoadAllEmployees()
        {
            var list = new List<Employee>();
            using var conn = new NpgsqlConnection(Config.BuildConnectionString());
            conn.Open();

            const string sql = @"
SELECT id, name, position, department, phone, daily_rate, schedule_type, shift_hours,
       anchor_date, birth_date, monthly_bonus, jubilee_bonus,
       sick_leave_percent, vacation_percent, maternity_percent, maternity_allowance
FROM employees
ORDER BY created_at ASC, name ASC;";

            using var cmd = new NpgsqlCommand(sql, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                list.Add(new Employee
                {
                    Id = reader.GetString(0),
                    Name = reader.GetString(1),
                    Position = reader.IsDBNull(2) ? "" : reader.GetString(2),
                    Department = reader.IsDBNull(3) ? "" : reader.GetString(3),
                    Phone = reader.IsDBNull(4) ? "" : reader.GetString(4),
                    DailyRate = reader.GetDecimal(5),
                    Schedule = (ScheduleType)reader.GetInt32(6),
                    ShiftHours = reader.GetInt32(7),
                    AnchorDate = reader.GetDateTime(8),
                    BirthDate = reader.IsDBNull(9) ? (DateTime?)null : reader.GetDateTime(9),
                    MonthlyBonus = reader.GetDecimal(10),
                    JubileeBonus = reader.GetDecimal(11),
                    SickLeaveCompensationPercent = reader.GetDecimal(12),
                    VacationCompensationPercent = reader.GetDecimal(13),
                    MaternityPayPercent = reader.GetDecimal(14),
                    MaternityMonthlyAllowance = reader.GetDecimal(15)
                });
            }

            return list;
        }

        public Dictionary<string, ShiftOverride> LoadAllOverrides()
        {
            var dict = new Dictionary<string, ShiftOverride>();
            using var conn = new NpgsqlConnection(Config.BuildConnectionString());
            conn.Open();

            const string sql = @"SELECT employee_id, shift_date, status, hours, note FROM shift_overrides;";
            using var cmd = new NpgsqlCommand(sql, conn);
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                string empId = reader.GetString(0);
                DateTime date = reader.GetDateTime(1);
                string key = empId + "_" + date.ToString("yyyy-MM-dd");
                dict[key] = new ShiftOverride
                {
                    Status = (ShiftStatus)reader.GetInt32(2),
                    Hours = reader.GetInt32(3),
                    Note = reader.IsDBNull(4) ? "" : reader.GetString(4)
                };
            }

            return dict;
        }

        public void UpsertEmployee(Employee emp)
        {
            if (!IsConnected || !Config.Enabled) return;
            try
            {
                using var conn = new NpgsqlConnection(Config.BuildConnectionString());
                conn.Open();
                UpsertEmployeeInternal(conn, emp);
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
            }
        }

        private static void UpsertEmployeeInternal(NpgsqlConnection conn, Employee emp)
        {
            const string sql = @"
INSERT INTO employees (
    id, name, position, department, phone, daily_rate, schedule_type, shift_hours,
    anchor_date, birth_date, monthly_bonus, jubilee_bonus,
    sick_leave_percent, vacation_percent, maternity_percent, maternity_allowance
)
VALUES (
    @id, @name, @position, @department, @phone, @daily_rate, @schedule_type, @shift_hours,
    @anchor_date, @birth_date, @monthly_bonus, @jubilee_bonus,
    @sick_leave_percent, @vacation_percent, @maternity_percent, @maternity_allowance
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    phone = EXCLUDED.phone,
    daily_rate = EXCLUDED.daily_rate,
    schedule_type = EXCLUDED.schedule_type,
    shift_hours = EXCLUDED.shift_hours,
    anchor_date = EXCLUDED.anchor_date,
    birth_date = EXCLUDED.birth_date,
    monthly_bonus = EXCLUDED.monthly_bonus,
    jubilee_bonus = EXCLUDED.jubilee_bonus,
    sick_leave_percent = EXCLUDED.sick_leave_percent,
    vacation_percent = EXCLUDED.vacation_percent,
    maternity_percent = EXCLUDED.maternity_percent,
    maternity_allowance = EXCLUDED.maternity_allowance;";

            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("id", emp.Id);
            cmd.Parameters.AddWithValue("name", emp.Name ?? "");
            cmd.Parameters.AddWithValue("position", emp.Position ?? "");
            cmd.Parameters.AddWithValue("department", emp.Department ?? "");
            cmd.Parameters.AddWithValue("phone", emp.Phone ?? "");
            cmd.Parameters.AddWithValue("daily_rate", emp.DailyRate);
            cmd.Parameters.AddWithValue("schedule_type", (int)emp.Schedule);
            cmd.Parameters.AddWithValue("shift_hours", emp.ShiftHours);
            cmd.Parameters.AddWithValue("anchor_date", emp.AnchorDate.Date);
            cmd.Parameters.AddWithValue("birth_date", emp.BirthDate.HasValue ? (object)emp.BirthDate.Value.Date : DBNull.Value);
            cmd.Parameters.AddWithValue("monthly_bonus", emp.MonthlyBonus);
            cmd.Parameters.AddWithValue("jubilee_bonus", emp.JubileeBonus);
            cmd.Parameters.AddWithValue("sick_leave_percent", emp.SickLeaveCompensationPercent);
            cmd.Parameters.AddWithValue("vacation_percent", emp.VacationCompensationPercent);
            cmd.Parameters.AddWithValue("maternity_percent", emp.MaternityPayPercent);
            cmd.Parameters.AddWithValue("maternity_allowance", emp.MaternityMonthlyAllowance);
            cmd.ExecuteNonQuery();
        }

        public void DeleteEmployee(string employeeId)
        {
            if (!IsConnected || !Config.Enabled) return;
            try
            {
                using var conn = new NpgsqlConnection(Config.BuildConnectionString());
                conn.Open();
                const string sql = "DELETE FROM employees WHERE id = @id;";
                using var cmd = new NpgsqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("id", employeeId);
                cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
            }
        }

        public void UpsertShiftOverride(string employeeId, DateTime date, ShiftOverride ov)
        {
            if (!IsConnected || !Config.Enabled) return;
            try
            {
                using var conn = new NpgsqlConnection(Config.BuildConnectionString());
                conn.Open();
                UpsertShiftOverrideInternal(conn, employeeId, date, ov);
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
            }
        }

        private static void UpsertShiftOverrideInternal(NpgsqlConnection conn, string employeeId, DateTime date, ShiftOverride ov)
        {
            const string sql = @"
INSERT INTO shift_overrides (employee_id, shift_date, status, hours, note)
VALUES (@employee_id, @shift_date, @status, @hours, @note)
ON CONFLICT (employee_id, shift_date) DO UPDATE SET
    status = EXCLUDED.status,
    hours = EXCLUDED.hours,
    note = EXCLUDED.note;";

            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("employee_id", employeeId);
            cmd.Parameters.AddWithValue("shift_date", date.Date);
            cmd.Parameters.AddWithValue("status", (int)ov.Status);
            cmd.Parameters.AddWithValue("hours", ov.Hours);
            cmd.Parameters.AddWithValue("note", ov.Note ?? "");
            cmd.ExecuteNonQuery();
        }
    }
}
