@echo off
call npm install
for /f "tokens=2 delims==" %%A in ('findstr PORT .env') do set PORT=%%A
start http://localhost:%PORT%
call npm start
pause


