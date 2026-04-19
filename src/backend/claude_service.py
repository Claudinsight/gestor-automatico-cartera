"""
Servicio que envuelve las llamadas a la API de Claude (Anthropic).

Construye el prompt a partir de los activos y el perfil de riesgo,
envía la petición a la API de Anthropic usando el SDK oficial y
devuelve un diccionario ya parseado con la selección recomendada.
"""

import json
import re
from typing import List

from anthropic import Anthropic

from config.settings import Settings


RISK_PROFILES = {
    "conservador": (
        "perfil conservador: prioriza ETFs y acciones de baja volatilidad, "
        "máx 10% por posición"
    ),
    "moderado": (
        "perfil moderado: mezcla acciones individuales y ETFs, "
        "máx 20% por posición"
    ),
    "agresivo": (
        "perfil agresivo: puede sobreponderar tecnología y crecimiento, "
        "máx 25% por posición"
    ),
}


class ClaudeService:
    """Encapsula la interacción con la API de Claude."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        if not settings.ANTHROPIC_API_KEY:
            raise RuntimeError(
                "ANTHROPIC_API_KEY no está definida. "
                "Configúrala en el archivo .env antes de arrancar."
            )
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    # ── Construcción del prompt ──────────────────────────────────────
    def _build_market_summary(self, assets: List[dict]) -> str:
        lines = []
        for a in assets:
            macd = f"+{a['macd']}" if a["macd"] > 0 else str(a["macd"])
            lines.append(
                f"{a['ticker']} ({a['name']}): precio={a['price']}, "
                f"RSI={a['rsi']}, ret1m={a['ret1m']}%, "
                f"volatilidad={a['volatility']}, beta={a['beta']}, "
                f"MACD={macd}, tendencia={a['trend']}"
            )
        return "\n".join(lines)

    def _build_system_prompt(self, risk_profile: str) -> str:
        risk_desc = RISK_PROFILES.get(risk_profile, RISK_PROFILES["moderado"])
        capital = self.settings.CAPITAL
        return (
            f"Eres un gestor de carteras cuantitativo experto. "
            f"Capital: {capital:.0f}€. {risk_desc}.\n"
            "Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra.\n"
            "Estructura exacta:\n"
            "{\n"
            '  "sesgo_mercado": "ALCISTA|NEUTRAL|BAJISTA",\n'
            '  "analisis": "2-3 frases sobre el mercado actual",\n'
            '  "riesgo_principal": "1 frase sobre el mayor riesgo",\n'
            '  "seleccion": [\n'
            '    {"ticker": "...", "accion": "COMPRAR|MANTENER|EVITAR", '
            '"peso_pct": number, "razon": "frase corta", '
            '"confianza": number(0-1), "objetivo_precio": number}\n'
            "  ],\n"
            '  "roi_3m": number,\n'
            '  "roi_12m": number,\n'
            '  "resumen": "1 frase ejecutiva"\n'
            "}\n"
            "Selecciona 5-8 activos para COMPRAR. El resto EVITAR o ignorar."
        )

    # ── Llamada principal ────────────────────────────────────────────
    def analyze(self, assets: List[dict], risk_profile: str) -> dict:
        """Pide un análisis de cartera a Claude y devuelve el JSON parseado."""
        from datetime import date

        market_summary = self._build_market_summary(assets)
        system_prompt = self._build_system_prompt(risk_profile)

        user_content = (
            f"Construye la cartera óptima con estos activos "
            f"(datos de mercado actuales):\n\n{market_summary}\n\n"
            f"Capital total: {self.settings.CAPITAL:.0f}€. "
            f"Perfil: {risk_profile}. "
            f"Fecha: {date.today().strftime('%d/%m/%Y')}."
        )

        message = self.client.messages.create(
            model=self.settings.CLAUDE_MODEL,
            max_tokens=self.settings.CLAUDE_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}],
        )

        text = message.content[0].text if message.content else "{}"
        return self._parse_json(text)

    # ── Utilidades ───────────────────────────────────────────────────
    @staticmethod
    def _parse_json(text: str) -> dict:
        """Limpia bloques markdown ```json y parsea el JSON."""
        clean = text.strip()
        clean = re.sub(r"^```(?:json)?\s*", "", clean)
        clean = re.sub(r"\s*```$", "", clean)
        try:
            return json.loads(clean)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"La respuesta de Claude no es JSON válido: {exc}\n"
                f"Respuesta recibida:\n{text[:500]}..."
            ) from exc
