@echo off
REM =====================================================================
REM   GESTOR AUTOMATICO DE CARTERA - Script de instalacion (Windows)
REM =====================================================================
REM   Este script hace TODO por ti:
REM     1. Comprueba que Python esta instalado
REM     2. Crea un entorno virtual aislado
REM     3. Instala todas las dependencias Python
REM     4. Crea el archivo .env a partir de la plantilla
REM   Solo tienes que abrir tu .env despues y poner tu clave de Claude.
REM =====================================================================

setlocal
cd /d "%~dp0"

echo.
echo ====================================================================
echo   INSTALACION DEL GESTOR AUTOMATICO DE CARTERA
echo ====================================================================
echo.

REM --- 1. Comprobar Python ----------------------------------------------
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no esta instalado.
    echo.
    echo Descargalo aqui: https://www.python.org/downloads/
    echo MUY IMPORTANTE: durante la instalacion marca la casilla
    echo "Add Python to PATH" antes de pulsar Install.
    echo.
    pause
    exit /b 1
)

echo [1/4] Python detectado:
python --version
echo.

REM --- 2. Crear entorno virtual -----------------------------------------
if not exist "venv\" (
    echo [2/4] Creando entorno virtual en "venv"...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b 1
    )
) else (
    echo [2/4] Entorno virtual "venv" ya existe, se reutiliza.
)
echo.

REM --- 3. Instalar dependencias -----------------------------------------
echo [3/4] Instalando dependencias (puede tardar 1-2 minutos)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo al instalar dependencias.
    pause
    exit /b 1
)
echo.

REM --- 4. Crear .env si no existe ---------------------------------------
if not exist ".env" (
    echo [4/4] Creando archivo .env a partir de .env.example...
    copy ".env.example" ".env" >nul
    echo.
    echo ============================================================
    echo   IMPORTANTE - PASO MANUAL NECESARIO
    echo ============================================================
    echo.
    echo   Abre el archivo .env con el Bloc de notas y sustituye
    echo   la linea:
    echo.
    echo       ANTHROPIC_API_KEY=sk-ant-api03-REEMPLAZA-...
    echo.
    echo   por tu clave real de Claude, que puedes obtener en:
    echo       https://console.anthropic.com/
    echo.
    echo ============================================================
) else (
    echo [4/4] Archivo .env ya existe, se respeta el existente.
)

echo.
echo ====================================================================
echo   INSTALACION COMPLETADA
echo ====================================================================
echo.
echo   Siguiente paso: doble clic en "ejecutar.bat" para arrancar la app.
echo.
pause
