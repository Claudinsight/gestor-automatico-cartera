"""Tests para el módulo portfolio."""

from src.backend.portfolio import build_portfolio


def _sample_analysis():
    """Análisis de ejemplo devuelto por Claude."""
    return {
        "sesgo_mercado": "ALCISTA",
        "analisis": "Mercado alcista con impulso tecnológico.",
        "riesgo_principal": "Volatilidad de tipos de interés.",
        "seleccion": [
            {"ticker": "AAPL", "accion": "COMPRAR", "peso_pct": 15, "razon": "Momentum sólido", "confianza": 0.85, "objetivo_precio": 230},
            {"ticker": "MSFT", "accion": "COMPRAR", "peso_pct": 20, "razon": "Cloud + IA", "confianza": 0.88, "objetivo_precio": 430},
            {"ticker": "SPY", "accion": "COMPRAR", "peso_pct": 15, "razon": "Exposición a índice", "confianza": 0.80, "objetivo_precio": 560},
            {"ticker": "NKE", "accion": "EVITAR", "peso_pct": 0, "razon": "Momentum negativo", "confianza": 0.75, "objetivo_precio": 80},
        ],
        "roi_3m": 4.2,
        "roi_12m": 12.5,
        "resumen": "Cartera diversificada con sesgo tecnológico.",
    }


def test_build_portfolio_excludes_non_compra():
    """Las acciones MANTENER/EVITAR no deben entrar en la cartera."""
    port = build_portfolio(_sample_analysis(), capital=20000)
    tickers = [p["ticker"] for p in port["posiciones"]]
    assert "NKE" not in tickers


def test_build_portfolio_includes_compra():
    """Las acciones COMPRAR deben entrar en la cartera."""
    port = build_portfolio(_sample_analysis(), capital=20000)
    tickers = [p["ticker"] for p in port["posiciones"]]
    assert {"AAPL", "MSFT", "SPY"}.issubset(set(tickers))


def test_liquidez_non_negative():
    """La liquidez nunca puede ser negativa."""
    port = build_portfolio(_sample_analysis(), capital=20000)
    assert port["liquidez"] >= 0


def test_stop_loss_applied():
    """El stop-loss debe ser un 8% por debajo del precio de entrada."""
    port = build_portfolio(_sample_analysis(), capital=20000, stop_loss_pct=8.0)
    for pos in port["posiciones"]:
        expected = round(pos["price"] * 0.92, 2)
        assert pos["stopLoss"] == expected


def test_capital_preserved():
    """El capital total debe coincidir con el parámetro."""
    port = build_portfolio(_sample_analysis(), capital=50000)
    assert port["capital"] == 50000


def test_invested_plus_liquidez_leq_capital():
    """Invertido + liquidez no puede superar el capital inicial."""
    capital = 20000
    port = build_portfolio(_sample_analysis(), capital=capital)
    invertido = sum(p["coste"] for p in port["posiciones"])
    assert invertido + port["liquidez"] <= capital + 0.01  # margen por redondeo


def test_empty_selection():
    """Si no hay selección, se devuelven 0 posiciones y toda la liquidez."""
    analysis = {"seleccion": []}
    port = build_portfolio(analysis, capital=10000)
    assert port["posiciones"] == []
    assert port["liquidez"] == 10000
