@echo off
call venv\Scripts\activate.bat
cd backend
start http://127.0.0.1:8000/admin
py manage.py runserver
pause