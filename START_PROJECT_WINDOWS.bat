@echo off
chcp 65001 > nul
title График Смен и Расчёт Зарплаты - Запуск проекта
echo ======================================================================
echo           ГРАФИК СМЕН И АВТОМАТИЧЕСКИЙ РАСЧЁТ ЗАРПЛАТЫ
echo               Запуск проекта для Visual Studio / Windows
echo ======================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ВНИМАНИЕ] Node.js не найден на вашем компьютере!
    echo.
    echo Чтобы проект работал в Visual Studio и локально на Windows:
    echo 1. Скачайте бесплатный Node.js с официального сайта: https://nodejs.org/
    echo 2. Установите его (нажимайте "Next" по умолчанию)
    echo 3. После установки снова запустите этот файл или нажмите F5 в Visual Studio.
    echo.
    pause
    exit /b 1
)

echo [1/3] Проверка установленных пакетов...
if not exist "node_modules\" (
    echo [2/3] Первая установка библиотек (npm install)... Пожалуйста, подождите...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ОШИБКА] Не удалось установить пакеты npm. Проверьте интернет-соединение.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Библиотеки уже установлены.
)

echo [3/3] Запуск веб-приложения на http://localhost:3000 ...
start http://localhost:3000
call npm run dev

pause
