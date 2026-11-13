-- ============================================================================
-- SQL-скрипт создания базы данных и таблиц для pgAdmin 4 (PostgreSQL)
-- Приложение "График Смен и Расчёт Зарплаты" (.NET 8)
-- ============================================================================
-- Шаг 1 в pgAdmin 4:
--   Создайте базу данных с именем: shift_schedule
--   (Правый клик по Databases -> Create -> Database -> Name: shift_schedule)
--
-- Шаг 2 в pgAdmin 4:
--   Откройте Query Tool для базы shift_schedule и выполните этот скрипт
--   (Либо просто нажмите "Подключить и создать таблицы" внутри самой программы!)
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL DEFAULT '',
    department VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(64) NOT NULL DEFAULT '',
    daily_rate NUMERIC(12, 2) NOT NULL DEFAULT 3500,
    schedule_type INTEGER NOT NULL DEFAULT 0, -- 0: TwoTwo, 1: FiveTwo, 2: OneThree, 3: ThreeThree, 4: SixOne
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
    status INTEGER NOT NULL, -- 0: Work, 1: Off, 2: UnplannedOff, 3: UnplannedWork, 4: Vacation, 5: VacationUnpaid, 6: Sick, 7: Maternity, 8: Absence
    hours INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    UNIQUE (employee_id, shift_date)
);

CREATE INDEX IF NOT EXISTS idx_shift_overrides_emp_date
    ON shift_overrides (employee_id, shift_date);
