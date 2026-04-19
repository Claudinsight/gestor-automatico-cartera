"""
Datos de mercado del universo de inversión.

Contiene tickers, precios, indicadores técnicos (RSI, MACD, volatilidad,
beta, retornos) y sector de cada activo. Los datos son representativos
y están pensados para paper trading / simulación educativa.

Para conectar datos reales basta con sustituir MARKET_UNIVERSE por una
llamada a un proveedor como yfinance, Alpha Vantage o Finnhub.
"""

from typing import Dict, List


MARKET_UNIVERSE: Dict[str, List[dict]] = {
    "Tecnología": [
        {"ticker": "AAPL", "name": "Apple", "price": 202.52, "rsi": 52.3, "ret1m": 3.1, "ret3m": 8.2, "volatility": 0.22, "beta": 1.15, "macd": 1.2, "trend": "↑", "sector": "Tecnología"},
        {"ticker": "MSFT", "name": "Microsoft", "price": 391.85, "rsi": 55.1, "ret1m": 5.2, "ret3m": 12.1, "volatility": 0.20, "beta": 1.08, "macd": 2.1, "trend": "↑", "sector": "Tecnología"},
        {"ticker": "NVDA", "name": "NVIDIA", "price": 875.40, "rsi": 61.2, "ret1m": 9.4, "ret3m": 24.3, "volatility": 0.42, "beta": 1.75, "macd": 8.3, "trend": "↑", "sector": "Tecnología"},
        {"ticker": "ASML", "name": "ASML Holding", "price": 718.60, "rsi": 48.7, "ret1m": -2.1, "ret3m": 5.8, "volatility": 0.28, "beta": 1.22, "macd": -0.8, "trend": "↑", "sector": "Tecnología"},
        {"ticker": "SAP", "name": "SAP SE", "price": 198.34, "rsi": 57.4, "ret1m": 4.8, "ret3m": 14.2, "volatility": 0.19, "beta": 0.98, "macd": 1.4, "trend": "↑", "sector": "Tecnología"},
    ],
    "Consumo": [
        {"ticker": "AMZN", "name": "Amazon", "price": 185.70, "rsi": 53.8, "ret1m": 6.1, "ret3m": 11.4, "volatility": 0.26, "beta": 1.32, "macd": 3.2, "trend": "↑", "sector": "Consumo"},
        {"ticker": "LVMH", "name": "LVMH", "price": 642.40, "rsi": 41.2, "ret1m": -4.8, "ret3m": -9.1, "volatility": 0.25, "beta": 0.88, "macd": -2.1, "trend": "↓", "sector": "Consumo"},
        {"ticker": "NKE", "name": "Nike", "price": 89.15, "rsi": 38.4, "ret1m": -6.2, "ret3m": -14.8, "volatility": 0.29, "beta": 0.95, "macd": -1.8, "trend": "↓", "sector": "Consumo"},
    ],
    "Finanzas": [
        {"ticker": "BRK-B", "name": "Berkshire", "price": 454.20, "rsi": 62.1, "ret1m": 7.8, "ret3m": 15.6, "volatility": 0.16, "beta": 0.78, "macd": 4.1, "trend": "↑", "sector": "Finanzas"},
        {"ticker": "JPM", "name": "JPMorgan", "price": 228.45, "rsi": 58.9, "ret1m": 6.2, "ret3m": 18.3, "volatility": 0.22, "beta": 1.15, "macd": 2.8, "trend": "↑", "sector": "Finanzas"},
        {"ticker": "SAN", "name": "Santander", "price": 5.82, "rsi": 44.1, "ret1m": -1.2, "ret3m": 4.1, "volatility": 0.31, "beta": 1.42, "macd": -0.2, "trend": "↑", "sector": "Finanzas"},
    ],
    "Salud": [
        {"ticker": "JNJ", "name": "J&J", "price": 158.20, "rsi": 50.4, "ret1m": 1.8, "ret3m": 4.2, "volatility": 0.14, "beta": 0.62, "macd": 0.4, "trend": "↑", "sector": "Salud"},
        {"ticker": "NOVO-B", "name": "Novo Nordisk", "price": 478.90, "rsi": 43.2, "ret1m": -5.1, "ret3m": -18.2, "volatility": 0.34, "beta": 0.72, "macd": -3.1, "trend": "↓", "sector": "Salud"},
    ],
    "Energía/Utilities": [
        {"ticker": "NEE", "name": "NextEra", "price": 72.40, "rsi": 47.8, "ret1m": -0.8, "ret3m": 2.1, "volatility": 0.18, "beta": 0.72, "macd": -0.1, "trend": "↑", "sector": "Energía/Utilities"},
        {"ticker": "IBE", "name": "Iberdrola", "price": 13.85, "rsi": 56.2, "ret1m": 3.4, "ret3m": 9.8, "volatility": 0.19, "beta": 0.65, "macd": 0.6, "trend": "↑", "sector": "Energía/Utilities"},
    ],
    "ETFs": [
        {"ticker": "SPY", "name": "S&P 500 ETF", "price": 519.80, "rsi": 55.6, "ret1m": 4.8, "ret3m": 9.2, "volatility": 0.15, "beta": 1.00, "macd": 3.2, "trend": "↑", "sector": "ETFs"},
        {"ticker": "QQQ", "name": "Nasdaq ETF", "price": 444.25, "rsi": 57.1, "ret1m": 6.2, "ret3m": 12.8, "volatility": 0.19, "beta": 1.18, "macd": 4.1, "trend": "↑", "sector": "ETFs"},
        {"ticker": "VGK", "name": "Europe ETF", "price": 71.80, "rsi": 53.4, "ret1m": 3.1, "ret3m": 7.4, "volatility": 0.17, "beta": 0.85, "macd": 1.2, "trend": "↑", "sector": "ETFs"},
    ],
}


def all_assets() -> List[dict]:
    """Devuelve una lista plana de todos los activos del universo."""
    return [asset for sector_assets in MARKET_UNIVERSE.values() for asset in sector_assets]


def find_asset(ticker: str) -> dict | None:
    """Busca un activo por ticker. Devuelve None si no existe."""
    for asset in all_assets():
        if asset["ticker"] == ticker:
            return asset
    return None
