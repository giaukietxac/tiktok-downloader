@echo off
title TraTuiLoc Server
cd /d "%~dp0"
echo ==============================================
echo   Dang khoi dong may chu TraTuiLoc...
echo   Dia chi web: http://localhost:3000
echo ==============================================
start http://localhost:3000
call npm start
pause
