# LO'PRIMO — official site

Plain HTML/CSS/JS, no build step, no framework. Open `index.html` in a
browser and it works; upload the whole folder anywhere static
(GitHub Pages, Netlify, any host) and it works there too.

## Estado actual: p&aacute;gina &uacute;nica ("save the date")

El sitio es ahora una sola p&aacute;gina: `index.html`. Es la foto de fondo
de pantalla completa, con el texto del anuncio encima y, al final, el
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

- **Fecha del show / texto del anuncio:** se edita directo en el
  `<h1>`/`<p>` de `index.html` dentro de `.splash-content`.
- **Fecha del bot&oacute;n "save the date" (para el calendario):** las
  constantes `STD_START` / `STD_END` cerca del final de `assets/app.js`
  (formato `AAAAMMDD`).
- **Links de redes sociales (footer):** `assets/about-data.js`.
- **Bot&oacute;n flotante "C&oacute;mprale un caf&eacute; al dev":** el link
  de Buy Me a Coffee est&aacute; en el `<a class="dev-cameo">` de
  `index.html`, justo despu&eacute;s del `</main>`.

Las p&aacute;ginas viejas (about/shows/music/contact) y sus
`*-writer.html` ya no est&aacute;n en el repo — si alg&uacute;n d&iacute;a
vuelve el sitio multi-p&aacute;gina, siguen disponibles en el historial
de git.
