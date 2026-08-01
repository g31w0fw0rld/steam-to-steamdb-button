# Steam to SteamDB Button

Tampermonkey userscript that adds a SteamDB button to Steam pages. / Userscript de Tampermonkey que añade un botón a SteamDB en las páginas de Steam.

![The SteamDB button below the wishlist row on a Steam game page](docs/screenshot-app.png)

*Game page (`/app/`): the button gets its own row below Steam's action bar, instead of crowding Follow / Ignore / Wishlist. / Página de juego (`/app/`): el botón recibe su propia fila bajo la barra de acciones de Steam, en vez de apretujarse con Follow / Ignore / Wishlist.*

![The SteamDB button inside the purchase box of a Steam package page](docs/screenshot-sub.png)

![The SteamDB button inside the purchase box of a Steam bundle page](docs/screenshot-bundle.png)

*Packages (`/sub/`) and bundles (`/bundle/`): the button goes straight into the purchase box, right under the price. / Paquetes (`/sub/`) y bundles (`/bundle/`): el botón entra directo en la caja de compra, justo bajo el precio.*

## English

### What it does

- Adds a button to **[SteamDB](https://steamdb.info/)** — price history, technical data, package contents and change tracking — on Steam **game** (`/app/`), **bundle** (`/bundle/`) and **package** (`/sub/`) pages.
- It links to **the matching SteamDB page for that exact product**, not to a search: the type and the numeric id both come from the URL you are already on, so an `/app/` opens `steamdb.info/app/…` and a `/sub/` opens `steamdb.info/sub/…`.
- **The button is placed differently depending on the page**, following each layout. On game pages it clones Steam's action container to open a separate row below it, so it does not squeeze in next to Follow / Ignore / Wishlist. On bundles and packages it is appended inside the purchase box.
- It is built with Steam's own `btn_black btn_medium` classes and carries the official SteamDB logo as inline SVG, so it looks like a native Steam button rather than an add-on.
- Opens in a new tab, leaving the store page as you left it.

**Language:** none needed — the button reads `SteamDB`, a brand name, in every language.

**Install:**
1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the installer: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (also on [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) and [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sites:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## Español

### Qué hace

- Añade un botón hacia **[SteamDB](https://steamdb.info/)** —historial de precios, datos técnicos, contenido de los paquetes y seguimiento de cambios— en las páginas de **juego** (`/app/`), **bundle** (`/bundle/`) y **paquete** (`/sub/`) de Steam.
- Enlaza a **la página de SteamDB de ese producto concreto**, no a una búsqueda: el tipo y el id numérico salen de la URL en la que ya estás, así que un `/app/` abre `steamdb.info/app/…` y un `/sub/` abre `steamdb.info/sub/…`.
- **El botón se coloca distinto según la página**, siguiendo cada maquetación. En las de juego clona el contenedor de acciones de Steam para abrir una fila aparte debajo, y así no se aprieta junto a Follow / Ignore / Wishlist. En bundles y paquetes se añade dentro de la caja de compra.
- Está construido con las clases propias de Steam (`btn_black btn_medium`) y lleva el logo oficial de SteamDB como SVG en línea, así que parece un botón nativo de Steam y no un añadido.
- Abre en una pestaña nueva y deja la página de la tienda como estaba.

**Idioma:** no hace falta — el botón dice `SteamDB`, que es una marca, en cualquier idioma.

**Instalación:**
1. Instala [Tampermonkey](https://www.tampermonkey.net/).
2. Abre el instalador: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (también en [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) y [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sitios:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## Privacy / Privacidad

**EN:** the script makes no network requests and stores nothing: it only reads the type and ID (app/bundle/sub) from the page URL to build the link and insert the SteamDB button. It declares `@grant none`, so it has no access to the userscript manager's privileged APIs (storage, cross-origin requests). Nothing is sent to third parties or to the author, and you only visit SteamDB if you click the button.

**ES:** el script no hace ninguna petición de red ni guarda nada: solo lee de la URL de la página el tipo y el ID (app/bundle/sub) para construir el enlace e insertar el botón hacia SteamDB. Declara `@grant none`, así que no tiene acceso a las APIs privilegiadas del gestor de userscripts (almacenamiento, peticiones entre dominios). No se envía nada a terceros ni al autor, y solo visitas SteamDB si haces clic en el botón.

## Support / Apoyar

This is part of something I'm building to grow. If it helps you and you'd like to support it, you can tip me on **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —only if you want—; and if a cause needs it more than I do, help that one instead.

Esto es parte de algo que estoy construyendo para crecer. Si te sirve y quieres apoyar, puedes invitarme un café en **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —solo si quieres—; y si hay una causa que lo necesite más que yo, ayúdala a ella.

---
Author / Autor: **g31w0fw0rld** · License / Licencia: **MIT**
