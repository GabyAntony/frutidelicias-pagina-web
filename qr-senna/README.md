# Ruleta de la Senna

Ruleta de la suerte en **HTML + CSS + JS vanilla** (sin dependencias, sin build).

Para el cliente es solo una ruleta: **gira y recibe un código**. La configuración
no se expone en la interfaz; se edita en el archivo `js/config.js`.

## Uso

Abre `index.html` en el navegador (funciona con doble clic, no necesita servidor).

Si prefieres servirlo:

```bash
cd qr-senna
python3 -m http.server 8000
# http://localhost:8000
```

## Funcionalidad

- **Ruleta animada** en canvas (2D) con aguja, sectores proporcionales a los porcentajes y efecto de tic.
- **Sorteo por peso**: el ganador se elige por probabilidad (no por ángulo al azar) y la animación se calcula para que la aguja caiga exactamente en el sector ganador.
- **Códigos únicos**: cada sorteo emite un código que **jamás se repite**. El registro se guarda en `localStorage`, así que sobrevive a recargas y es compartido entre pestañas.
- **Items de un solo uso**: con `"unico": true` el item se apaga (sale tachado en la ruleta) después de salir una vez. Cuando no queda ningún premio disponible, el panel de resultado ofrece un botón para reiniciar los sorteos.
- Las etiquetas se dibujan **a lo largo del radio** de cada sector, se voltean solas en la mitad izquierda para que nunca queden al revés y usan tinta clara u oscura según el color del sector.
- Botón para copiar el código.

## Configuración

La configuración vive en **`js/config.js`** (no hay panel de configuración en la web).
Para cambiar los premios, editar ese archivo y recargar la página.

```js
window.CONFIG_RULETA = {
  titulo: 'Ruleta de la Senna',
  prefijoCodigo: 'SENNA',
  items: [
    {
      label: 'Café',
      descripcion: 'Café de la casa, sin azúcar',
      porcentaje: 25,
      codigo: 'CAF',
      unico: false
    }
  ]
};
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `label` | sí | Texto del sector en la ruleta |
| `descripcion` | no | Texto que se muestra al ganar |
| `porcentaje` | no | Peso del item. `0` = nunca sale. Si se omite, todos pesan igual |
| `codigo` | no | Prefijo del código emitido (ej. `CAF` → `CAF-X7K2QM`) |
| `unico` | no | `true` = el item se descarta tras salir una vez |

Notas:

- Los porcentajes **no tienen que sumar 100**: se normalizan automáticamente.
- Si no defines `codigo` en el item, se usa `prefijoCodigo`.
- Los caracteres ambiguos (I, O, 0, 1) se excluyen del código para poder dictarlo.
- Los items de un solo uso se identifican por una clave interna (`indice::label`), así que dos premios con el mismo nombre no se pisan entre sí.

## Estructura

```
qr-senna/
├── index.html          # estructura de la página
├── css/styles.css      # estilos
└── js/
    ├── config.js       # configuración de la ruleta (la edita el admin)
    ├── codigos.js      # emisión y persistencia de códigos únicos
    └── ruleta.js       # dibujo, sorteo y animación
```

## Claves en localStorage

| Clave | Contenido |
|---|---|
| `ruleta.v1.codigos` | Histórico de códigos emitidos |
| `ruleta.v1.items.usados.v2` | Items de un solo uso ya gastados (clave `indice::label`) |
| `ruleta.v1.items.usados` | Formato antiguo, solo se usa para migrar |

El histórico de códigos se puede recuperar desde la consola del navegador:

```js
JSON.parse(localStorage.getItem('ruleta.v1.codigos'))
```
