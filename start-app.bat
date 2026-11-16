@echo off
title कारेगाव रेंटल रूम्स ॲप (Karegaon Rental App)
echo ========================================================
echo   कारेगाव रेंटल रूम्स व लाईट बिल मॅनेजमेंट ॲप
echo   Karegaon Pune Rental Rooms & Light Bill System
echo ========================================================
echo.
echo Server सुरू करत आहे... कृपया थांबा...
cd /d "%~dp0"
start http://localhost:3000
node server.js
pause
