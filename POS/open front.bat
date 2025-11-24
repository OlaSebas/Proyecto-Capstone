@echo off
call venv\Scripts\activate.bat
cd frontend
start http://localhost:5173
npm run dev
pause