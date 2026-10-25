# Fruti Delicias

Landing page del negocio Fruti Delicias: fruta fresca + chocolate irresistible.

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4
- **Backend:** Python 3.11+ (FastAPI) + SQLAlchemy + PostgreSQL

## Estructura

```
proyecto-senna/
├── .replit            # configuración de arranque en Replit
├── compose.yaml       # Postgres local para desarrollo
├── start.sh           # arranque de producción (backend + frontend)
├── dev.sh             # arranque local con recarga automática
├── frontend/          # Next.js (App Router)
│   └── public/images/ # Coloca aquí las fotos del producto
├── backend/           # FastAPI
│   ├── app/           # catálogo, pedidos, auth, Telegram
│   ├── data/          # datos locales (SQLite opcional)
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
- **Persistencia:** PostgreSQL (por defecto el de `compose.yaml` en local; en
  Vercel, una base gestionada como Vercel Postgres/Neon). SQLite queda como
  alternativa para pruebas y para el arranque de Replit sin `DATABASE_URL`.
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
| `DATABASE_URL` | URL de Postgres. Por defecto `postgresql+psycopg://fruti:fruti@localhost:5432/fruti` (el Postgres de `compose.yaml`). Para pruebas también se acepta SQLite: `sqlite:///./data/fruti.db`. |
| `FRONTEND_ORIGINS` | Orígenes permitidos, separados por coma. Debe incluir `https://<tu-app>.replit.app` o tu dominio de Vercel. |
| `COOKIE_SECURE` | `true` en HTTPS (producción). |
| `COOKIE_SAMESITE` | `lax` (recomendado). |

En el **frontend** (carpeta `frontend/`):

| Variable | Uso |
|----------|-----|
| `BACKEND_URL` | Solo local/Replit: URL interna del API a la que el frontend reescribe `/api/*`, p. ej. `http://127.0.0.1:8000`. **No se define en Vercel** (el enrutamiento lo hace `vercel.json`). |
| `NEXT_PUBLIC_API_URL` | Raíz del API usada por el navegador. Por defecto `/api` (mismo origen). En Vercel no hace falta definirla. |

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
`/api/*`, así que la cookie de sesión del panel es *same-origin* y no hace
falta exponer el puerto 8000.

Antes del primer arranque, define los Secrets del backend en Replit
(panel **Secrets**) y `BACKEND_URL=http://127.0.0.1:8000` en las variables del
frontend. `start.sh` usa SQLite por defecto en Replit; si defines `DATABASE_URL`
con una URL de Postgres, la respeta.

### En Vercel (servicios)

El repositorio incluye `vercel.json` en la raíz con dos servicios:

| Servicio | Carpeta | Ruta pública |
|----------|---------|--------------|
| `backend` | `backend/` | `/api/*` |
| `frontend` | `frontend/` | todas las demás rutas (`/`, `/admin`, …) |

Importa el repositorio en Vercel sin configurar un *Root Directory*: Vercel lee
`vercel.json`. El backend es un FastAPI con entrypoint `main:app` y el frontend
es Next.js.

Variables de entorno del proyecto en Vercel (las usa el servicio `backend`):

| Variable | Valor |
|----------|-------|
| `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Igual que en Replit. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Opcionales, para las alertas. |
| `FRONTEND_ORIGINS` | `https://<tu-proyecto>.vercel.app` (y los dominios de preview que uses). |
| `COOKIE_SECURE` | `true`. |
| `COOKIE_SAMESITE` | `lax`. |
| `DATABASE_URL` | URL de Postgres gestionado. Es la forma de persistir los pedidos en Vercel. |

> **Postgres en Vercel.** Crea una base con **Vercel Postgres/Neon** (Storage en
> el dashboard) o usa cualquier Postgres externo. Copia su cadena de conexión en
> `DATABASE_URL`; se aceptan tanto `postgresql://...` como
> `postgresql+psycopg://...` (el código normaliza el driver). Las tablas se crean
> solas al arrancar el backend (`Base.metadata.create_all` en el lifespan), así
> que no hace falta ejecutar migraciones para esta versión.
>
> Usa preferiblemente la URL *pooled* que ofrece el proveedor para funciones
> serverless. No uses SQLite en Vercel: el sistema de archivos de las funciones
> es efímero y no permite conservar los pedidos.

No definas `BACKEND_URL` ni `NEXT_PUBLIC_API_URL` en Vercel: el navegador llama
a `/api/*` en el mismo dominio y `vercel.json` lo enruta al servicio `backend`.
No hay llamadas servidor-a-servidor, así que no se necesitan *bindings*.

Para probar todo junto en local con el enrutamiento real de Vercel:

```bash
vercel dev
```

### Local

Levanta Postgres con Docker (solo la primera vez crea el volumen):

```bash
docker compose up -d db
```

Luego arranca todo:

```bash
# Todo junto (recomendado)
bash ./dev.sh
```

O por partes:

```bash
# Desde la raíz, para tener Postgres disponible
docker compose up -d db

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ajusta SECRET_KEY y credenciales
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
.venv/bin/python -m pytest -q          # 55 pruebas
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
