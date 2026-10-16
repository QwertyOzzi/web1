@echo off
chcp 65001 > nul
title Выгрузка Arz MODS WebSell на GitHub
color 0b

echo ============================================================
echo        Выгрузка проекта WebSell на GitHub
echo        Репозиторий: https://github.com/QwertyOzzi/web1.git
echo ============================================================
echo.

set "GIT_EXE=%~dp0.tools\git\cmd\git.exe"

if not exist "%GIT_EXE%" (
    echo [!] Встроенный Git не найден. Проверьте папку .tools\git
    pause
    exit /b
)

echo [1/3] Индексация и фиксация изменений...
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "Update: Cosmic Storefront & Products" > nul 2>&1

echo [2/3] Подготовка ветки main...
"%GIT_EXE%" branch -M main

echo [3/3] Отправка файлов в репозиторий...
echo.
echo ВНИМАНИЕ: Если GitHub запросит логин и пароль:
echo - Username: QwertyOzzi
echo - Password: ваш Personal Access Token (токен с правами repo)
echo.

"%GIT_EXE%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo [УСПЕХ] Сайт успешно загружен на GitHub!
    echo.
    echo Теперь включите GitHub Pages:
    echo 1. Откройте: https://github.com/QwertyOzzi/web1/settings/pages
    echo 2. В разделе "Build and deployment" выберите Branch: "main", Folder: "/ (root)"
    echo 3. Нажмите Save!
    echo.
    echo Ваш сайт заработает по адресу:
    echo 👉 https://qwertyozzi.github.io/web1/
    echo ============================================================
) else (
    echo.
    echo [!] Произошла ошибка при отправке (проверьте правильность токена/доступа).
)

echo.
pause
