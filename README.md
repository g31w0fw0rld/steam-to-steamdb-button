# Steam to SteamDB Button

Userscript de Tampermonkey que añade un botón a SteamDB en las páginas de Steam. / Tampermonkey userscript that adds a SteamDB button to Steam pages.

## Español

**Qué hace:** en las páginas de **app, bundle o sub** de Steam añade un botón hacia **[SteamDB](https://steamdb.info/)** (historial de precios, datos técnicos, cambios) colocándolo en el contenedor de acciones adecuado según el tipo de página.

**Instalación:**
1. Instala [Tampermonkey](https://www.tampermonkey.net/).
2. Abre el instalador: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (también en [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) y [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sitios:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## English

**What it does:** on Steam **app, bundle or sub** pages it adds a button to **[SteamDB](https://steamdb.info/)** (price history, technical data, changes), placing it in the appropriate action container for each page type.

**Install:**
1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the installer: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (also on [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) and [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sites:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## Privacidad / Privacy

**ES:** el script no hace ninguna petición de red ni guarda nada: solo lee de la URL de la página el tipo y el ID (app/bundle/sub) para construir el enlace e insertar el botón hacia SteamDB. Declara `@grant none`, así que no tiene acceso a las APIs privilegiadas del gestor de userscripts (almacenamiento, peticiones entre dominios). No se envía nada a terceros ni al autor, y solo visitas SteamDB si haces clic en el botón.

**EN:** the script makes no network requests and stores nothing: it only reads the type and ID (app/bundle/sub) from the page URL to build the link and insert the SteamDB button. It declares `@grant none`, so it has no access to the userscript manager's privileged APIs (storage, cross-origin requests). Nothing is sent to third parties or to the author, and you only visit SteamDB if you click the button.

## Apoyar / Support

Esto es parte de algo que estoy construyendo para crecer. Si te sirve y quieres apoyar, puedes invitarme un café en **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —solo si quieres—; y si hay una causa que lo necesite más que yo, ayúdala a ella.

This is part of something I'm building to grow. If it helps you and you'd like to support it, you can tip me on **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —only if you want—; and if a cause needs it more than I do, help that one instead.

---
Autor / Author: **g31w0fw0rld** · Licencia / License: **MIT**
