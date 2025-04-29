@echo off
call npm install express
call npm install axios
call npm install dotenv
call npm install mysql
call npm install express-rate-limit
for /f "tokens=2 delims==" %%A in ('findstr PORT .env') do set PORT=%%A
start http://localhost:%PORT%
call npm start
pause


