"""Tests para el módulo market_data."""

from src.backend.market_data import MARKET_UNIVERSE, all_assets, find_asset


def test_universe_not_empty():
    """El universo debe contener al menos un sector con activos."""
    assert len(MARKET_UNIVERSE) > 0
    assert all(len(assets) > 0 for assets in MARKET_UNIVERSE.values())


def test_all_assets_flattens_universe():
    """all_assets() devuelve todos los tickers del universo en una lista plana."""
    flat = all_assets()
    total = sum(len(sector) for sector in MARKET_UNIVERSE.values())
    assert len(flat) == total


def test_each_asset_has_required_fields():
    """Cada activo debe tener los campos mínimos requeridos."""
    required = {
        "ticker", "name", "price", "rsi", "ret1m",
        "ret3m", "volatility", "beta", "macd", "trend", "sector",
    }
    for asset in all_assets():
        assert required.issubset(asset.keys()), (
            f"{asset.get('ticker')} no tiene todos los campos requeridos"
        )


def test_find_asset_returns_correct_ticker():
    """find_asset devuelve el activo correcto o None."""
    apple = find_asset("AAPL")
    assert apple is not None
    assert apple["name"] == "Apple"

    missing = find_asset("NO-EXISTE")
    assert missing is None


def test_minimum_sectors():
    """El universo debe cubrir al menos 4 sectores para permitir diversificación."""
    assert len(MARKET_UNIVERSE) >= 4
