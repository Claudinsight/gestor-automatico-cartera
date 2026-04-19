# Gestor Automático de Cartera de Inversión

Aplicación full-stack que construye carteras de inversión optimizadas usando la IA de **Claude (Anthropic)** como gestor cuantitativo. Incluye paper trading, reglas de riesgo automáticas (stop-loss, concentración máxima, diversificación sectorial) y visualización en tiempo real.

> ⚠️ **Aviso legal**: esta aplicación es una simulación educativa (paper trading). **No constituye asesoramiento financiero**. La inversión conlleva riesgo de pérdida del capital. Consulta a un asesor EFPA/CFA antes de operar con dinero real.

---

## Tabla de contenidos

1. [Características](#caracteristicas)
2. [Arquitectura](#arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Instalación paso a paso](#instalacion-paso-a-paso)
5. [Configuración](#configuracion)
6. [Uso](#uso)
7. [API del backend](#api-del-backend)
8. [Tests](#tests)
9. [Licencia](#licencia)

---

## Características

- **Análisis cuantitativo con Claude AI**: envía al modelo el universo de activos con sus indicadores (RSI, MACD, volatilidad, beta, retornos) y recibe una selección razonada con pesos, objetivos de precio y nivel de confianza.
- **3 perfiles de riesgo**: conservador, moderado y agresivo. Cada uno cambia la estrategia (ETFs vs acciones) y el peso máximo por posición.
- **Reglas de riesgo automáticas**: stop-loss del 8%, concentración máxima del 25%, mínimo 4 sectores, reserva de liquidez.
- **Dashboard profesional**: KPIs, análisis de mercado, detalle por posición, métricas de riesgo y universo completo — todo en una interfaz oscura estilo terminal.
- **Arquitectura segura**: la API key de Claude vive **solo en el backend**, nunca en el navegador.

---

## Arquitectura

```
 ┌──────────────────┐     HTTP/JSON      ┌──────────────────┐    HTTPS     ┌─────────────────┐
 │  Frontend React  │ ─────────────────→ │  Backend Flask   │ ──────────→  │  API Anthropic  │
 │    (Vite SPA)    │                    │   (Python 3.11+) │              │     (Claude)    │
 │   puerto 5173    │ ←───────────────── │   puerto 5000    │ ←──────────  │                 │
 └──────────────────┘                    └──────────────────┘              └─────────────────┘
          │                                       │
          │                                       ▼
          │                                ┌──────────────────┐
          └──── universo de mercado ────→ │  market_data.py  │
                                           │  (20 activos)    │
                                           └──────────────────┘
```

**Flujo de una petición**:

1. El usuario elige un perfil de riesgo en el frontend y pulsa *Ejecutar IA*.
2. El frontend llama a `POST /api/analyze` del backend Flask.
3. El backend construye el prompt (instrucciones + activos + indicadores) y llama a la API de Claude usando la API key del servidor.
4. Claude responde con un JSON estructurado (selección, pesos, razones).
5. El backend valida la respuesta, aplica reglas de riesgo y calcula la cartera final (acciones compradas, coste, stop-loss, upside).
6. El frontend muestra KPIs, gráficas y tabla detallada.

---

## Estructura del proyecto

```
gestor-automatico-cartera/
├── main.py                          # Punto de entrada (arranca el servidor Flask)
├── requirements.txt                 # Dependencias Python
├── README.md                        # Este archivo
├── .gitignore                       # Archivos ignorados por git
├── .env.example                     # Plantilla de variables de entorno
│
├── config/
│   ├── __init__.py
│   └── settings.py                  # Configuración centralizada (carga .env)
│
├── src/
│   ├── __init__.py
│   ├── backend/                     # API Python (Flask)
│   │   ├── __init__.py
│   │   ├── app.py                   # Factory Flask + rutas /api/*
│   │   ├── claude_service.py        # Llamadas a la API de Anthropic
│   │   ├── market_data.py           # Universo de activos (tickers + indicadores)
│   │   └── portfolio.py             # Constructor de la cartera
│   │
│   └── frontend/                    # SPA React (Vite)
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       ├── main.jsx
│       └── components/
│           └── PortfolioManager.jsx # Componente principal
│
└── tests/
    ├── __init__.py
    ├── test_portfolio.py            # Tests del constructor de cartera
    └── test_market_data.py          # Tests de los datos de mercado
```

---

## Instalación paso a paso

### Requisitos previos

- **Python 3.11 o superior** — [Descargar Python](https://www.python.org/downloads/)
- **Node.js 18 o superior** — [Descargar Node.js](https://nodejs.org/)
- **Clave API de Anthropic** — [Obtener en console.anthropic.com](https://console.anthropic.com/)
- **Git** — [Descargar Git](https://git-scm.com/downloads)

### 1 · Clonar el repositorio

```bash
git clone https://github.com/Claudinsight/gestor-automatico-cartera.git
cd gestor-automatico-cartera
```

### 2 · Preparar el backend Python

```bash
# Crear un entorno virtual (recomendado)
python -m venv venv

# Activar el entorno
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3 · Preparar el frontend React

```bash
cd src/frontend
npm install
cd ../..
```

### 4 · Configurar las variables de entorno

```bash
# Copia la plantilla
cp .env.example .env
# En Windows (cmd):    copy .env.example .env
# En Windows (PowerShell): Copy-Item .env.example .env
```

Edita `.env` con un editor de texto y añade tu clave real de Anthropic en `ANTHROPIC_API_KEY`.

---

## Configuración

Todas las opciones configurables viven en `.env`:

| Variable           | Descripción                                  | Valor por defecto    |
| ------------------ | -------------------------------------------- | -------------------- |
| `ANTHROPIC_API_KEY`| Clave de tu cuenta Anthropic                 | (obligatoria)        |
| `CLAUDE_MODEL`     | Modelo de Claude a usar                      | `claude-sonnet-4-5`  |
| `CLAUDE_MAX_TOKENS`| Tokens máximos por respuesta                 | `2000`               |
| `FLASK_HOST`       | Host del servidor Flask                      | `0.0.0.0`            |
| `FLASK_PORT`       | Puerto del servidor Flask                    | `5000`               |
| `FLASK_DEBUG`      | Modo debug (recarga automática)              | `False`              |
| `CAPITAL`          | Capital total simulado en euros              | `20000`              |
| `MAX_POSITION_PCT` | Peso máximo por posición (%)                 | `25`                 |
| `STOP_LOSS_PCT`    | Porcentaje de stop-loss                      | `8`                  |
| `MIN_SECTORS`      | Nº mínimo de sectores para diversificar      | `4`                  |

---

## Uso

### Opción A — Desarrollo (frontend y backend por separado)

En **dos terminales**:

```bash
# Terminal 1 · Backend Flask
python main.py
# → Servidor en http://localhost:5000
```

```bash
# Terminal 2 · Frontend React (Vite)
cd src/frontend
npm run dev
# → App en http://localhost:5173
```

Abre http://localhost:5173 en el navegador. Vite proxia automáticamente `/api/*` al backend Flask.

### Opción B — Producción (un solo servidor)

```bash
# 1. Compilar el frontend
cd src/frontend
npm run build
cd ../..

# 2. Arrancar Flask (sirve API + frontend compilado)
python main.py
```

Abre http://localhost:5000 y ¡listo!

### Cómo ejecutar un análisis

1. Elige un **perfil de riesgo**: conservador, moderado o agresivo.
2. Pulsa **▶ Ejecutar IA**.
3. Observa el log en tiempo real mientras Claude analiza el universo.
4. Consulta los resultados en las pestañas **Cartera · Mercado · Riesgo**.

---

## API del backend

| Método | Ruta          | Descripción                                                      |
| ------ | ------------- | ---------------------------------------------------------------- |
| GET    | `/api/health` | Healthcheck + estado de la API key                               |
| GET    | `/api/market` | Devuelve el universo de activos y las reglas de riesgo           |
| POST   | `/api/analyze`| Dispara el análisis con Claude y devuelve la cartera optimizada  |

**Ejemplo** (`POST /api/analyze`):

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"risk_profile":"moderado"}'
```

Respuesta:
```json
{
  "risk_profile": "moderado",
  "analysis": { "sesgo_mercado": "ALCISTA", "analisis": "...", "seleccion": [...] },
  "portfolio": { "posiciones": [...], "liquidez": 1200.5, "capital": 20000 }
}
```

---

## Tests

```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=src --cov-report=term-missing
```

---

## Licencia

Este proyecto es de uso educativo. No usar con capital real sin supervisión de un asesor financiero certificado.
