@echo off
REM =====================================================================
REM   GESTOR AUTOMATICO DE CARTERA - Script de arranque (Windows)
REM =====================================================================
REM   Activa el entorno virtual, arranca el servidor Flask y abre
REM   el navegador en la aplicacion.
REM =====================================================================

setlocal
cd /d "%~dp0"

echo.
echo ====================================================================
echo   ARRANCANDO GESTOR AUTOMATICO DE CARTERA
echo ====================================================================
echo.

REM --- Comprobar que existe el entorno virtual --------------------------
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] No se encuentra el entorno virtual.
    echo   Ejecuta primero "install.bat" para instalar la aplicacion.
    echo.
    pause
    exit /b 1
)

REM --- Comprobar que existe el archivo .env -----------------------------
if not exist ".env" (
    echo [ERROR] No existe el archivo .env.
    echo   Ejecuta primero "install.bat" para crearlo.
    echo.
    pause
    exit /b 1
)

REM --- Aviso si la API key sigue siendo la del ejemplo ------------------
findstr /C:"REEMPLAZA-CON-TU-CLAVE-REAL" .env >nul 2>&1
if not errorlevel 1 (
    echo ============================================================
    echo   AVISO - API KEY NO CONFIGURADA
    echo ============================================================
    echo   El archivo .env todavia tiene el valor de ejemplo.
    echo   Abrelo con el Bloc de notas y pon tu clave real de Claude
    echo   antes de pulsar "Ejecutar IA" en la aplicacion.
    echo ============================================================
    echo.
)

REM --- Activar entorno y arrancar ---------------------------------------
call venv\Scripts\activate.bat

echo Abriendo el navegador en http://localhost:5000 ...
start "" "http://localhost:5000"
echo.
echo El servidor se esta arrancando. Para PARAR la aplicacion cierra
echo esta ventana o pulsa CTRL+C.
echo.

python main.py

pause
