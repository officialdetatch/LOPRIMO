# LO'PRIMO — official site

Plain HTML/CSS/JS, no build step, no framework. Open `index.html` in a
browser and it works; upload the whole folder anywhere static
(GitHub Pages, Netlify, any host) and it works there too.

## Estado actual: p&aacute;gina &uacute;nica

El sitio es ahora una sola p&aacute;gina: `index.html`. Es la foto de fondo
de pantalla completa, con el anuncio y el pr&oacute;ximo evento encima y, al final, el
footer con los logos de redes. Nada m&aacute;s — no hay nav, ni otras
p&aacute;ginas, ni formularios.

Esta ya es la p&aacute;gina que debe estar publicada; no hay nada que
renombrar ni reemplazar. `CNAME` sigue apuntando a `loprimofficial.vip`.

## Archivos

| Archivo / carpeta     | Qu&eacute; es                                              |
|------------------------|------------------------------------------------------------|
| `index.html`           | La p&aacute;gina &uacute;nica — todo el sitio               |
| `assets/style.css`     | Estilos (solo lo que usa `index.html`)                      |
| `assets/app.js`        | Comportamiento: men&uacute; de "save the date" + iconos del footer |
| `assets/about-data.js` | Los 4 links de redes sociales que usa el footer             |
| `images/`              | Logo, foto de fondo, los 4 logos de redes sociales          |
| `audio/`               | Las 5 canciones que suenan de fondo (aleatorio) en la p&aacute;gina |
| `manifest.json`        | Icono/metadata para "agregar a inicio" en el tel&eacute;fono |
| `CNAME`                | Dominio de GitHub Pages (loprimofficial.vip)                 |

## Editar contenido

- **Texto de arriba ("PRIMOS!"):** el `<div class="hero-intro">` en `index.html`.
- **Pr&oacute;ximo evento (nombre, links, lugar, fecha, cover):** el
  `<section class="next-event">` en `index.html`. El nombre del evento
  enlaza a su Instagram y el lugar enlaza a Google Maps.
- **Hora del evento (cuenta regresiva + "Agregar al calendario"):**
  `EVENT_START` en `assets/app.js`, con la hora de RD
  (`2026-10-12T20:00:00-04:00`). Ah&iacute; mismo est&aacute;n el t&iacute;tulo,
  la direcci&oacute;n y la duraci&oacute;n (`EVENT_HOURS`) del evento de calendario.
  Cuando llega la hora, la cuenta regresiva se cambia sola por
  "&iexcl;Lleg&oacute; el d&iacute;a!".
- **Links de redes sociales (footer):** `assets/about-data.js`.
- **Bot&oacute;n flotante "C&oacute;mprale un caf&eacute; al dev":** el link est&aacute; en
  el `<a class="dev-cameo">` de `index.html`. Flota en la esquina de
  abajo a la derecha, al nivel de los iconos de redes.

Las p&aacute;ginas viejas (about/shows/music/contact) y sus
`*-writer.html` ya no est&aacute;n en el repo — si alg&uacute;n d&iacute;a
vuelve el sitio multi-p&aacute;gina, siguen disponibles en el historial
de git.
