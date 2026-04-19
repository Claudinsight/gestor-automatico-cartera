"""
Gestor Automático de Cartera de Inversión
==========================================
Punto de entrada principal de la aplicación.

Ejecuta el servidor Flask que expone la API del backend
y sirve el frontend React compilado.

Uso:
    python main.py

Variables de entorno requeridas (definidas en .env):
    ANTHROPIC_API_KEY   Clave de la API de Anthropic (Claude)
    FLASK_HOST          Host del servidor (por defecto 0.0.0.0)
    FLASK_PORT          Puerto del servidor (por defecto 5000)
    FLASK_DEBUG         Modo debug (True/False)
"""

from src.backend.app import create_app
from config.settings import Settings


def main() -> None:
    """Arranca el servidor Flask."""
    settings = Settings()
    app = create_app(settings)

    print("=" * 60)
    print("  GESTOR AUTOMÁTICO DE CARTERA DE INVERSIÓN")
    print("=" * 60)
    print(f"  Servidor:  http://{settings.FLASK_HOST}:{settings.FLASK_PORT}")
    print(f"  Modo:      {'DEBUG' if settings.FLASK_DEBUG else 'PRODUCCIÓN'}")
    print(f"  API Key:   {'✓ configurada' if settings.ANTHROPIC_API_KEY else '✗ NO configurada'}")
    print("=" * 60)

    app.run(
        host=settings.FLASK_HOST,
        port=settings.FLASK_PORT,
        debug=settings.FLASK_DEBUG,
    )


if __name__ == "__main__":
    main()
