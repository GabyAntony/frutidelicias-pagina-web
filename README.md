# Fruti Delicias

Landing page del negocio Fruti Delicias: fruta fresca + chocolate irresistible.

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4
- **Backend:** Python 3.11+ (FastAPI) + SQLAlchemy + SQLite

## Estructura

```
proyecto-senna/
├── .replit            # configuración de arranque en Replit
├── start.sh           # arranque de producción (backend + frontend)
├── dev.sh             # arranque local con recarga automática
├── frontend/          # Next.js (App Router)
│   └── public/images/ # Coloca aquí las fotos del producto
├── backend/           # FastAPI
│   ├── app/           # catálogo, pedidos, auth, Telegram
│   ├── data/          # fruti.db (base de datos persistente)
│   └── tests/         # pytest
└── qr-senna/          # ruleta de la suerte (proyecto aparte, sin build)
```

## Imágenes

No hay imágenes embebidas. Los bloques con borde punteado son placeholders.

Coloca los archivos en `frontend/public/images/` con estos nombres:

| Slot | Uso sugerido |
|------|----------------|
| `hero-bowl.jpg` | Hero circular |
| `bowl-fresa-chocolate.jpg` | Producto 1 |
| `brocheta-tropical.jpg` | Producto 2 |
| `mix-crocante.jpg` | Producto 3 |
| `delicia-premium.jpg` | Producto 4 |
| `story-main.jpg` | Historia (principal) |
| `story-product.jpg` | Historia |
| `story-ambiente.jpg` | Historia |
| `testimonial-1.jpg` … | Avatares |

## Sistema de pedidos

Los clientes agregan productos al carrito, confirman recogida en el local y pagan
en efectivo o Nequi al recoger. No hay pagos en línea.

- **Precios y total:** los calcula **siempre el servidor** con el catálogo de
  `backend/app/catalog.py`. El precio que manda el navegador se ignora.
- **Catálogo:** el frontend lo pide a `GET /api/products`, así que el cliente
  siempre ve el precio vigente. La lista estática del frontend es solo un
  respaldo de primer pintado.
- **Persistencia:** SQLite en `backend/data/fruti.db` (sobrevive reinicios en Replit).
- **Panel:** `/admin` con sesión httpOnly firmada con `SECRET_KEY`. Todos los
  endpoints `/api/admin/*` exigen sesión válida + cabecera `X-Requested-With`.
- **Telegram:** alerta al dueño cuando entra un pedido nuevo. Se envía en
  segundo plano: si Telegram falla o está lento, el pedido igual queda guardado
  y se puede ver en el panel (columna "telegram_error").
- **WhatsApp:** al marcar un pedido como listo para recoger, el panel ofrece un
  enlace `wa.me` con el mensaje redactado (no envía solo: el dueño lo revisa y
  pulsa Enviar).
- **Idempotencia:** cada pedido lleva una clave `Idempotency-Key`. Si el cliente
  reintenta el envío, el servidor devuelve el pedido original en vez de crear
  uno duplicado.
- **Zona horaria:** las fechas se guardan en UTC y se muestran en **hora de
  Bogotá** (UTC-5) en el panel y en el mensaje de Telegram.

### Estados

| Estado del pedido | Transiciones permitidas |
|-------------------|--------------------------|
| `nuevo` | → `en_preparacion`, → `cancelado` |
| `en_preparacion` | → `listo_para_recoger`, → `cancelado` |
| `listo_para_recoger` | → `entregado`, → `cancelado` |
| `entregado` | — |
| `cancelado` | — |

| Estado del pago | Significado |
|-----------------|-------------|
| `pendiente` | Se paga al recoger (por defecto) |
| `pagado` | Ya se cobró en efectivo o Nequi |

### Variables de entorno (Replit Secrets / `.env`)

En el **backend** (carpeta `backend/`):

| Variable | Uso |
|----------|-----|
| `SECRET_KEY` | Firma de la cookie de sesión. **Obligatoria**: genera una cadena larga y aleatoria. Sin ella el panel queda deshabilitado. |
| `ADMIN_USERNAME` | Usuario del panel. |
| `ADMIN_PASSWORD` | Contraseña del panel. No la subas al repo. |
| `TELEGRAM_BOT_TOKEN` | Token del bot (BotFather). Solo servidor. |
| `TELEGRAM_CHAT_ID` | Chat o grupo donde llegarán los pedidos. |
| `DATABASE_URL` | Opcional. Por defecto `sqlite:///<ruta>/backend/data/fruti.db`. |
| `FRONTEND_ORIGINS` | Orígenes permitidos, separados por coma. Debe incluir `https://<tu-app>.replit.app`. |
| `COOKIE_SECURE` | `true` en HTTPS (producción). |
| `COOKIE_SAMESITE` | `lax` (recomendado). |

En el **frontend** (carpeta `frontend/`):

| Variable | Uso |
|----------|-----|
| `BACKEND_URL` | URL interna del API, p. ej. `http://127.0.0.1:8000`. |
| `NEXT_PUBLIC_API_URL` | Debe ser `/backend` para el proxy same-origin (cookies). |

Cómo obtener Telegram:

1. En Telegram habla con [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Copia el token a `TELEGRAM_BOT_TOKEN`.
3. Envía un mensaje a tu bot y abre `https://api.telegram.org/bot<TOKEN>/getUpdates` **solo en tu navegador**, no en el código.
4. Copia el `chat.id` a `TELEGRAM_CHAT_ID`.
5. No pegues el token en el frontend ni en capturas públicas.

Genera el `SECRET_KEY` con:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Arranque

### En Replit (producción)

El botón **Run** ejecuta `bash ./start.sh`, que:

1. crea el entorno virtual e instala `backend/requirements.txt`;
2. levanta la API en `127.0.0.1:8000`;
3. espera a que `/api/health` responda;
4. compila el frontend y lo sirve en `0.0.0.0:3000`.

Solo se publica el puerto **3000**. El frontend hace de proxy hacia la API con
`/backend/*`, así que la cookie de sesión del panel es *same-origin* y no hace
falta exponer el puerto 8000.

Antes del primer arranque, define los Secrets del backend en Replit
(panel **Secrets**) y `BACKEND_URL=http://127.0.0.1:8000` en las variables del
frontend.

### Local

```bash
# Todo junto (recomendado)
bash ./dev.sh
```

O por partes:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000 · Panel: http://localhost:3000/admin · API docs: http://localhost:8000/docs

## Panel administrativo

`/admin` es privado. Entra con `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

Desde ahí puedes:

- ver la lista de pedidos y el detalle de cada uno;
- filtrar por estado (nuevo, en preparación, listo para recoger, entregado, cancelado);
- cambiar el estado del pedido;
- marcar el pago como pagado;
- abrir el mensaje de WhatsApp con el pedido listo (el enlace `wa.me` solo aparece
  cuando el pedido está en "listo para recoger");
- editar los datos del local (nombre, dirección, horario de recogida, teléfono y
  métodos de pago) sin tocar el código.

Los datos del local se muestran en la página, en el checkout y en el mensaje de
WhatsApp.

## Pruebas

```bash
cd backend
.venv/bin/python -m pytest -q          # 53 pruebas
cd ../frontend
npm run lint && npm run build
```

## Identidad de marca

| Token | Hex |
|-------|-----|
| Rojo tinto | `#730D0D` |
| Chocolate | `#4C1E0D` |
| Amarillo frutal | `#F2D06B` |
| Coral | `#F28A80` |

Tipografía: **Bebas Neue** (títulos) · **Poppins** (cuerpo)
# frutidelicias-pagina-web
