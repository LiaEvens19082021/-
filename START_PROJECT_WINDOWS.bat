@echo off
chcp 65001 > nul
title График Смен и Расчёт Зарплаты - Запуск БЕЗ Node.js
echo ======================================================================
echo           ГРАФИК СМЕН И АВТОМАТИЧЕСКИЙ РАСЧЁТ ЗАРПЛАТЫ
echo               100%% РАБОТАЕТ БЕЗ УСТАНОВКИ NODE.JS!
echo ======================================================================
echo.
echo Выберите вариант запуска:
echo.
echo [1] Запустить приложение в Visual Studio (C# 7.3 Windows Desktop)
echo [2] Запустить напрямую C# приложение (через dotnet run)
echo [3] Открыть веб-интерфейс в браузере (Автономный HTML - БЕЗ Node.js)
echo [4] Выход
echo.

set /p choice="Введите номер (1, 2 или 3): "

if "%choice%"=="1" (
    echo.
    echo Открытие решения в Visual Studio...
    start ShiftScheduleApp.sln
    echo.
    echo Решение открыто! Нажмите клавишу F5 в Visual Studio для запуска.
    pause
    exit /b 0
)

if "%choice%"=="2" (
    echo.
    echo Запуск проекта C# Windows Forms...
    where dotnet >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ИНФО] Команда dotnet не найдена в PATH.
        echo Открываем решение в Visual Studio (где встроен компилятор .NET):
        start ShiftScheduleApp.sln
        pause
        exit /b 0
    )
    dotnet run --project csharp\ShiftScheduleCSharp.csproj
    pause
    exit /b 0
)

if "%choice%"=="3" (
    echo.
    echo Открытие интерфейса в вашем браузере (без серверов и без Node.js)...
    start standalone_offline.html
    exit /b 0
)

exit /b 0
