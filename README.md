# Steam to SteamDB Button

Tampermonkey userscript that adds SteamDB, GG.deals and PCGamingWiki buttons to Steam pages. / Userscript de Tampermonkey que añade botones a SteamDB, GG.deals y PCGamingWiki en las páginas de Steam.

![The three buttons in their own row below the action bar on a Steam game page](docs/screenshot-app.png)

*Game page (`/app/`): the buttons get their own row below Steam's action bar, instead of crowding Follow / Ignore / Wishlist. / Página de juego (`/app/`): los botones reciben su propia fila bajo la barra de acciones de Steam, en vez de apretujarse con Follow / Ignore / Wishlist.*

![The three buttons below the purchase header of a Steam bundle page](docs/screenshot-bundle.png)

![The three buttons below the purchase header of a Steam package page](docs/screenshot-sub.png)

*Bundles (`/bundle/`) and packages (`/sub/`): the buttons go into the purchase area, right under the price. / Bundles (`/bundle/`) y paquetes (`/sub/`): los botones entran en la zona de compra, justo bajo el precio.*

## English

### What it does

Adds three buttons to Steam **game** (`/app/`), **bundle** (`/bundle/`) and **package** (`/sub/`) pages:

- **[SteamDB](https://steamdb.info/)** — price history, technical data, package contents and change tracking. It links to **the matching page for that exact product**, not to a search: the type and the numeric id both come from the URL you are already on, so an `/app/` opens `steamdb.info/app/…` and a `/sub/` opens `steamdb.info/sub/…`.
- **[GG.deals](https://gg.deals/)** — where else that game is on sale, and for how much. It searches **by title among Steam-DRM deals only**, since that is the DRM of everything sold in this store, and it turns off the default store-rating floor so no offer is hidden from you.
- **[PCGamingWiki](https://www.pcgamingwiki.com/)** — compatibility, fixes, ultrawide and frame-rate notes. It searches for **the game itself**: without the edition suffix and, on a DLC, a package or a bundle, by the game it belongs to, which is where PCGamingWiki documents it.

Details worth knowing:

- **The last two are title searches, so they can miss**, and each says exactly that in its tooltip. The SteamDB button carries no tooltip: it is built from the ID in the URL and cannot miss, and the brand name already says where it goes.
- **The name comes from Steam's own API, in English.** The store translates product names — `/app/2358720/` is `Black Myth: Wukong` in English and `黑神话：悟空` in Chinese — while GG.deals and PCGamingWiki index in English, so the page title alone would search for something neither site has. The buttons are drawn straight away with the title read from the page (cleaned of the `Buy …` prefix, the `… on Steam` suffix and trademark symbols) and the two links are rewritten as soon as the English name arrives; if the API does not answer they simply stay as they were. Accents are dropped for GG.deals only, because it transliterates in its own index, and kept for PCGamingWiki, whose articles keep them.
- **A DLC, a package or a bundle sends PCGamingWiki to its game.** The wiki has no article per DLC or per package, it documents them inside the game, so a DLC uses the `fullgame` that Steam's API already returns, and a package or bundle holding a single game uses that game. With several games inside — *The Orange Box* and its seven — there is no single game to point at, so the name of the package is kept. GG.deals does sell them separately, so it always gets the full name.
- **Placement follows each layout.** On game pages the script clones Steam's action container to open a separate row below it. On bundles and packages the three go into their own row inside the purchase area.
- All three use Steam's own `btn_black btn_medium` classes, so they read as native Steam buttons rather than an add-on. They are real links, so middle-click and *copy link address* work.
- They open in a new tab, leaving the store page as you left it.

**Language:** the labels are brand names, the same in every language. The two tooltips come in **30 languages** — English, Spanish, Latin American Spanish, German, French, Italian, Dutch, Portuguese, Brazilian Portuguese, Polish, Russian, Ukrainian, Czech, Hungarian, Romanian, Bulgarian, Greek, Turkish, Swedish, Danish, Norwegian, Finnish, Japanese, Korean, Simplified Chinese, Traditional Chinese, Thai, Vietnamese, Indonesian and Malay — read from `<html lang>`, which is the language you picked in Steam's own selector, then from your browser if the page did not say, falling back to English.

**Install:**
1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the installer: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (also on [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) and [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sites:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## Español

### Qué hace

Añade tres botones en las páginas de **juego** (`/app/`), **bundle** (`/bundle/`) y **paquete** (`/sub/`) de Steam:

- **[SteamDB](https://steamdb.info/)** —historial de precios, datos técnicos, contenido de los paquetes y seguimiento de cambios—. Enlaza a **la página de ese producto concreto**, no a una búsqueda: el tipo y el id numérico salen de la URL en la que ya estás, así que un `/app/` abre `steamdb.info/app/…` y un `/sub/` abre `steamdb.info/sub/…`.
- **[GG.deals](https://gg.deals/)** —en qué otras tiendas está de oferta ese juego, y a cuánto—. Busca **por título y solo entre ofertas con DRM de Steam**, que es el DRM de todo lo que se vende en esta tienda, y desactiva el mínimo de valoración de tienda que trae por defecto para que no te esconda ninguna oferta.
- **[PCGamingWiki](https://www.pcgamingwiki.com/)** —compatibilidad, arreglos, ultrapanorámico y notas de frame rate—. Busca **el juego en sí**: sin el sufijo de edición y, en un DLC, un paquete o un bundle, por el juego al que pertenece, que es donde PCGamingWiki lo documenta.

Detalles que conviene saber:

- **Los dos últimos buscan por nombre, así que pueden no acertar**, y cada uno lo dice tal cual en su tooltip. El de SteamDB no lleva tooltip: se construye con el ID de la URL y no puede fallar, y la marca ya dice a dónde va.
- **El nombre lo da la propia API de Steam, en inglés.** La tienda traduce los nombres de los productos —`/app/2358720/` es `Black Myth: Wukong` en inglés y `黑神话：悟空` en chino— mientras que GG.deals y PCGamingWiki están indexados en inglés, así que con el título de la página se buscaría algo que ninguno de los dos tiene. Los botones se pintan de inmediato con el título leído de la página (limpio del `Comprar …`, del `… en Steam` y de los símbolos de marca) y los dos enlaces se reescriben en cuanto llega el nombre en inglés; si la API no contesta, se quedan como estaban. Los acentos se quitan solo para GG.deals, porque translitera en su índice, y se conservan para PCGamingWiki, cuyos artículos sí los llevan.
- **Un DLC, un paquete o un bundle mandan a PCGamingWiki a su juego.** La wiki no tiene artículo por DLC ni por paquete, los documenta dentro del juego, así que un DLC usa el `fullgame` que ya devuelve la API de Steam, y un paquete o bundle con un solo juego dentro usa ese juego. Con varios dentro —*The Orange Box* y sus siete— no hay un juego al que apuntar y se conserva el nombre del paquete. GG.deals sí los vende por separado, así que recibe siempre el nombre completo.
- **La colocación sigue cada maquetación.** En las páginas de juego el script clona el contenedor de acciones de Steam para abrir una fila aparte debajo. En bundles y paquetes los tres van en su propia fila dentro de la zona de compra.
- Los tres usan las clases propias de Steam (`btn_black btn_medium`), así que parecen botones nativos y no un añadido. Son enlaces de verdad, así que funcionan el clic central y *copiar dirección del enlace*.
- Abren en una pestaña nueva y dejan la página de la tienda como estaba.

**Idioma:** las etiquetas son marcas, iguales en cualquier idioma. Los dos tooltips vienen en **30 idiomas** —inglés, español, español de Latinoamérica, alemán, francés, italiano, neerlandés, portugués, portugués de Brasil, polaco, ruso, ucraniano, checo, húngaro, rumano, búlgaro, griego, turco, sueco, danés, noruego, finés, japonés, coreano, chino simplificado, chino tradicional, tailandés, vietnamita, indonesio y malayo—, leídos del `<html lang>`, que es el idioma que elegiste en el propio selector de Steam, y luego del navegador si la página no lo dijera, con inglés como respaldo.

**Instalación:**
1. Instala [Tampermonkey](https://www.tampermonkey.net/).
2. Abre el instalador: [steam-to-steamdb-button.user.js](https://github.com/g31w0fw0rld/steam-to-steamdb-button/raw/main/steam-to-steamdb-button.user.js) (también en [GreasyFork](https://greasyfork.org/es-419/users/1590477-g31w) y [OpenUserJS](https://openuserjs.org/users/g31w0fw0rldgmail.com/scripts)).

**Sitios:** `store.steampowered.com/app/*`, `/bundle/*`, `/sub/*`

## Privacy / Privacidad

**EN:** the script sends nothing to third parties or to the author. From the page it reads only the type and ID (app/bundle/sub) in the URL and the product title, both used to build the links. It declares `@grant none`, so it has no access to the userscript manager's privileged APIs. It asks **Steam's own store API** — the same site you are already on, so no cross-origin request is involved — for the English name of the product you are looking at; that call carries only the id from the URL, goes out with `credentials: 'omit'` so no cookie or session travels with it, and its answer is kept in `localStorage` for 30 days so the same product is not asked twice. One request does leave your browser towards a third party: the GG.deals button shows that site's favicon, loaded from `gg.deals`, so GG.deals sees a plain image request when the button is drawn — nothing about which game you are looking at. The SteamDB and PCGamingWiki logos are inline SVG and request nothing. You only visit any of the three sites if you click.

**ES:** el script no envía nada a terceros ni al autor. De la página lee solo el tipo y el ID (app/bundle/sub) de la URL y el título del producto, y con eso arma los enlaces. Declara `@grant none`, así que no tiene acceso a las APIs privilegiadas del gestor de userscripts. Le pregunta a **la propia API de la tienda de Steam** —el mismo sitio en el que ya estás, así que no hay petición entre dominios— el nombre en inglés del producto que estás viendo; esa llamada lleva solo el id de la URL, sale con `credentials: 'omit'` así que no viaja ninguna cookie ni sesión, y su respuesta se guarda en `localStorage` 30 días para no preguntar dos veces por el mismo producto. Sí sale una petición de tu navegador hacia un tercero: el botón de GG.deals muestra el favicon de ese sitio, cargado desde `gg.deals`, así que GG.deals ve una petición de imagen corriente al dibujarse el botón —nada sobre qué juego estás viendo—. Los logos de SteamDB y PCGamingWiki son SVG en línea y no piden nada. Solo visitas cualquiera de los tres sitios si haces clic.

## Support / Apoyar

This is part of something I'm building to grow. If it helps you and you'd like to support it, you can tip me on **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —only if you want—; and if a cause needs it more than I do, help that one instead.

Esto es parte de algo que estoy construyendo para crecer. Si te sirve y quieres apoyar, puedes invitarme un café en **[Ko-fi](https://ko-fi.com/g31w0fw0rld)** —solo si quieres—; y si hay una causa que lo necesite más que yo, ayúdala a ella.

---
Author / Autor: **g31w0fw0rld** · License / Licencia: **MIT**
