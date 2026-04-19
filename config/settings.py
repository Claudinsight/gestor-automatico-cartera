"""
Configuración centralizada de la aplicación.
Carga variables de entorno desde el archivo .env.
"""

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv


# Cargar variables del .env (solo si existe; en producción pueden venir del entorno)
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE)


def _as_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


@dataclass
class Settings:
    """Configuración de la aplicación cargada desde variables de entorno."""

    # ── API de Claude ─────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = field(
        default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", "")
    )
    CLAUDE_MODEL: str = field(
        default_factory=lambda: os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")
    )
    CLAUDE_MAX_TOKENS: int = field(
        default_factory=lambda: int(os.getenv("CLAUDE_MAX_TOKENS", "2000"))
    )

    # ── Servidor Flask ────────────────────────────────────────────
    FLASK_HOST: str = field(
        default_factory=lambda: os.getenv("FLASK_HOST", "0.0.0.0")
    )
    FLASK_PORT: int = field(
        default_factory=lambda: int(os.getenv("FLASK_PORT", "5000"))
    )
    FLASK_DEBUG: bool = field(
        default_factory=lambda: _as_bool(os.getenv("FLASK_DEBUG"), default=False)
    )

    # ── Parámetros de la cartera ──────────────────────────────────
    CAPITAL: float = field(
        default_factory=lambda: float(os.getenv("CAPITAL", "20000"))
    )
    MAX_POSITION_PCT: float = field(
        default_factory=lambda: float(os.getenv("MAX_POSITION_PCT", "25"))
    )
    STOP_LOSS_PCT: float = field(
        default_factory=lambda: float(os.getenv("STOP_LOSS_PCT", "8"))
    )
    MIN_SECTORS: int = field(
        default_factory=lambda: int(os.getenv("MIN_SECTORS", "4"))
    )

    # ── Rutas ─────────────────────────────────────────────────────
    BASE_DIR: Path = field(
        default_factory=lambda: Path(__file__).resolve().parent.parent
    )
