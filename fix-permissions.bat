@echo off
:: Script cap toan quyen (Full Control) cho thu muc du an
title Cap quyen Du an My Nghe Dong Phong
echo ========================================================
echo   CAP QUYEN FULL CONTROL CHO USER TREN THU MUC DU AN
echo ========================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [CANH BAO] File chua duoc chay duoi quyen Administrator!
    echo Vui long chuot phai vao file "fix-permissions.bat" va chon "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo [1/3] Dang cap quyen so huu thu muc cho nhom Quan tri...
takeown /F "%~dp0." /A /R /D Y >nul 2>&1

echo [2/3] Dang cap toan quyen (Full Control) cho tai khoan %USERNAME%...
icacls "%~dp0." /grant "%USERNAME%:(OI)(CI)F" /T /Q >nul 2>&1

echo [3/3] Dang cap toan quyen cho tat ca Users va .git...
icacls "%~dp0.git" /grant "%USERNAME%:(OI)(CI)F" /T /Q >nul 2>&1
icacls "%~dp0." /grant "BUILTIN\Users:(OI)(CI)F" /T /Q >nul 2>&1

echo.
echo ========================================================
echo   [THANH CONG] DA CAP TOAN QUYEN FULL CONTROL!
echo   Tu gio moi thao tac Git va sua file se khong bao gio bi chan quyen nua.
echo ========================================================
echo.
pause
