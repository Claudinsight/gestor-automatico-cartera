"""
Constructor de la cartera.

Toma el análisis devuelto por Claude y calcula las posiciones
finales respetando las reglas de riesgo configuradas:
- Stop-loss por defecto al -8% del precio de entrada
- Peso máximo por posición (por perfil de riesgo)
- Normalización si la suma de pesos supera el 90%
"""

from typing import List

from src.backend.market_data import find_asset


def build_portfolio(analysis: dict, capital: float, stop_loss_pct: float = 8.0) -> dict:
    """
    Construye la cartera final a partir del análisis de Claude.

    Args:
        analysis: JSON devuelto por ClaudeService.analyze()
        capital: capital total disponible
        stop_loss_pct: porcentaje de stop-loss (por defecto 8%)

    Returns:
        dict con claves:
          - posiciones: list[dict]  con cada posición enriquecida
          - liquidez:   float       con el efectivo sobrante
          - capital:    float       con el capital inicial
    """
    seleccion = analysis.get("seleccion", [])
    compras = [s for s in seleccion if s.get("accion") == "COMPRAR"]
    total_peso = sum(s.get("peso_pct", 0) for s in compras)

    liquidez = capital
    posiciones: List[dict] = []

    stop_factor = 1 - (stop_loss_pct / 100)

    for sel in compras:
        asset = find_asset(sel["ticker"])
        if not asset:
            continue

        # Normalización: si la suma de pesos supera 90%, escalar a 85%
        peso_norm = (
            (sel["peso_pct"] / total_peso) * 85
            if total_peso > 90
            else sel["peso_pct"]
        )
        valor_pos = capital * peso_norm / 100
        acciones = int(valor_pos // asset["price"])
        coste = acciones * asset["price"]
        liquidez -= coste

        objetivo = sel.get("objetivo_precio") or asset["price"] * 1.12
        upside = ((objetivo / asset["price"]) - 1) * 100

        posiciones.append({
            **asset,
            **sel,
            "peso_pct": round(peso_norm, 2),
            "acciones": acciones,
            "coste": round(coste, 2),
            "stopLoss": round(asset["price"] * stop_factor, 2),
            "upside": round(upside, 1),
        })

    return {
        "posiciones": posiciones,
        "liquidez": max(0.0, round(liquidez, 2)),
        "capital": capital,
    }
