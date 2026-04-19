# Guía rápida — 3 pasos para arrancar la aplicación

Hola Pedro. Esta es la versión sin tecnicismos. Haz exactamente lo que pone aquí.

---

## Paso 0 · Instala Python (solo la primera vez, 5 min)

1. Entra en https://www.python.org/downloads/
2. Pulsa el botón amarillo grande **Download Python 3.12** (o la versión que te muestre).
3. Ejecuta el archivo descargado (estará en tu carpeta Descargas).
4. **⚠️ MUY IMPORTANTE**: en la primera pantalla del instalador, marca la casilla **"Add python.exe to PATH"** (abajo del todo) antes de pulsar *Install Now*.
5. Cuando termine, cierra el instalador.

Si ya tenías Python instalado, salta este paso.

---

## Paso 1 · Instala la aplicación

Entra en la carpeta del proyecto (`gestor-automatico-cartera`) y **haz doble clic en `install.bat`**.

Se abrirá una ventana negra (la consola). Espera 1-2 minutos mientras se instala todo. Cuando veas `INSTALACION COMPLETADA`, puedes cerrar la ventana.

---

## Paso 2 · Pon tu clave de Claude en el archivo `.env`

Necesitas una clave API de Anthropic (Claude) para que la aplicación funcione. Se obtiene así:

1. Entra en https://console.anthropic.com/
2. Inicia sesión (o crea una cuenta — es gratis; hace falta añadir un método de pago pero no te cobran hasta que uses la API).
3. Ve al menú **API Keys** y pulsa **Create Key**.
4. Copia la clave que aparece (empieza por `sk-ant-api03-…`). **Solo se muestra una vez.**

Luego:

5. Entra en la carpeta `gestor-automatico-cartera`.
6. Haz clic derecho en el archivo `.env` (el que no tiene extensión, al lado de `.env.example`) → **Abrir con** → **Bloc de notas**.
7. Busca la línea: `ANTHROPIC_API_KEY=sk-ant-api03-REEMPLAZA-CON-TU-CLAVE-REAL`
8. Sustituye todo lo que hay después del `=` por tu clave real.
9. Guarda con **Ctrl + S** y cierra.

> **Si no ves el archivo `.env`**: en el Explorador de Windows, pestaña **Vista** → marca la casilla **Elementos ocultos**.

---

## Paso 3 · Arranca la aplicación

**Doble clic en `ejecutar.bat`**.

Se abrirá automáticamente tu navegador en http://localhost:5000 con la aplicación lista.

- Para **parar** la aplicación: cierra la ventana negra (la consola) o pulsa Ctrl+C dentro de ella.
- Para **volver a abrirla** otro día: solo doble clic en `ejecutar.bat`. No tienes que instalar nada de nuevo.

---

## Cómo usar la aplicación

1. Elige el perfil de riesgo: **conservador**, **moderado** o **agresivo**.
2. Pulsa el botón **▶ Ejecutar IA** (arriba a la derecha).
3. Claude analizará 20 activos y te devolverá una cartera optimizada con:
   - Tabla de posiciones (ticker, peso, coste, stop-loss, upside, confianza).
   - Análisis de mercado.
   - Métricas de riesgo.

---

## Si algo falla

| Problema | Solución |
|---|---|
| `install.bat` dice "Python no esta instalado" | Haz el Paso 0 y **marca la casilla PATH** en el instalador. |
| `ejecutar.bat` se cierra de repente | Abre una ventana negra (Inicio → escribe `cmd`), arrastra `ejecutar.bat` dentro y pulsa Enter. Te mostrará el error. |
| La app dice "API key no configurada" | Vuelve al Paso 2. La clave tiene que empezar por `sk-ant-api03-`. |
| "Puerto 5000 ya en uso" | Ya lo tienes abierto en otra ventana. Cierra la otra y vuelve a intentarlo. |

---

## Aviso importante

Esta aplicación es **paper trading** (simulación educativa). No compra ni vende nada de verdad. Solo te muestra qué cartera construiría Claude con 20.000 € simulados. **No es asesoramiento financiero**.
