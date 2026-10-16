@echo off
chcp 65001 > nul
title Arz MODS WebSell - Магазин цифровых товаров
color 0b

echo ============================================================
echo         Arz MODS WebSell • Магазин цифровых товаров
echo            Дизайн в стиле web.tribute.tg
echo ============================================================
echo.
echo [1/2] Запуск локального сервера...
start "" http://localhost:5000
echo [2/2] Открытие браузера на http://localhost:5000
echo.
echo Для остановки сервера закройте это окно (или нажмите Ctrl+C).
echo.

python server.py 5000
pause
