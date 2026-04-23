@echo off
echo [INFO] Starting SmartLink Backend...

:: Check if virtual environment exists
if exist venv\Scripts\activate (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate
) else (
    echo [WARNING] No virtual environment found. Running with system Python...
    echo [TIP] Consider creating one with 'python -m venv venv'
)

:: Install requirements if needed (optional, but helpful for first run)
:: echo [INFO] Checking dependencies...
:: pip install -r requirements.txt

:: Start the server
echo [INFO] Starting FastAPI server on http://127.0.0.1:8000
python -m uvicorn app.main:app --reload

pause
