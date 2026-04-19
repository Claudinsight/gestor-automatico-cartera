"""
Aplicación Flask que expone la API del Gestor Automático de Cartera.

Rutas:
    GET  /api/health       — comprobación de vida
    GET  /api/market       — devuelve el universo de activos
    POST /api/analyze      — dispara el análisis con Claude
                             body: {"risk_profile": "conservador|moderado|agresivo"}
    GET  /                 — sirve el frontend (si está compilado)
"""

from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from config.settings import Settings
from src.backend.claude_service import ClaudeService, RISK_PROFILES
from src.backend.market_data import MARKET_UNIVERSE, all_assets
from src.backend.portfolio import build_portfolio


def create_app(settings: Settings | None = None) -> Flask:
    """Factory que crea la app Flask."""
    settings = settings or Settings()

    # Ruta al frontend compilado (dist de Vite). Si no existe, se sirve
    # solo la API y el frontend se puede arrancar por separado con npm run dev.
    frontend_dist = settings.BASE_DIR / "src" / "frontend" / "dist"
    static_folder = str(frontend_dist) if frontend_dist.exists() else None

    app = Flask(__name__, static_folder=static_folder, static_url_path="")
    CORS(app)
    app.config["SETTINGS"] = settings

    # ── Rutas de la API ──────────────────────────────────────────
    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY),
            "model": settings.CLAUDE_MODEL,
        })

    @app.get("/api/market")
    def market():
        return jsonify({
            "universe": MARKET_UNIVERSE,
            "capital": settings.CAPITAL,
            "rules": {
                "stop_loss_pct": settings.STOP_LOSS_PCT,
                "max_position_pct": settings.MAX_POSITION_PCT,
                "min_sectors": settings.MIN_SECTORS,
            },
        })

    @app.post("/api/analyze")
    def analyze():
        body = request.get_json(silent=True) or {}
        risk_profile = body.get("risk_profile", "moderado")

        if risk_profile not in RISK_PROFILES:
            return jsonify({
                "error": f"Perfil de riesgo inválido. Debe ser uno de: "
                         f"{list(RISK_PROFILES.keys())}"
            }), 400

        if not settings.ANTHROPIC_API_KEY:
            return jsonify({
                "error": "ANTHROPIC_API_KEY no configurada en el servidor. "
                         "Añade la clave al archivo .env y reinicia."
            }), 500

        try:
            service = ClaudeService(settings)
            analysis = service.analyze(all_assets(), risk_profile)
            portfolio = build_portfolio(
                analysis,
                capital=settings.CAPITAL,
                stop_loss_pct=settings.STOP_LOSS_PCT,
            )
            return jsonify({
                "analysis": analysis,
                "portfolio": portfolio,
                "risk_profile": risk_profile,
            })
        except Exception as exc:  # noqa: BLE001  (queremos devolver el error al cliente)
            return jsonify({
                "error": str(exc),
                "type": type(exc).__name__,
            }), 500

    # ── Frontend (si está compilado) ─────────────────────────────
    if static_folder:
        @app.get("/")
        def index():
            return send_from_directory(static_folder, "index.html")

        @app.errorhandler(404)
        def spa_fallback(_err):
            # Para que React Router funcione, 404s se redirigen al index
            index_file = Path(static_folder) / "index.html"
            if index_file.exists():
                return send_from_directory(static_folder, "index.html")
            return jsonify({"error": "not found"}), 404
    else:
        @app.get("/")
        def placeholder():
            return jsonify({
                "message": "Backend del Gestor de Cartera arrancado.",
                "frontend": (
                    "El frontend no está compilado todavía. Arranca el dev "
                    "server con: cd src/frontend && npm install && npm run dev"
                ),
                "endpoints": ["/api/health", "/api/market", "/api/analyze"],
            })

    return app
